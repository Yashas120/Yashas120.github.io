import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1536, height: 960 },
] as const;

async function openBackend(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/backend/", { waitUntil: "networkidle" });
  await expect(page.locator(".bk-root")).toBeVisible();
}

async function setProgress(page: Page, progress: number) {
  await page.locator(".bk-story__track").evaluate((element, value) => {
    const track = element as HTMLElement;
    scrollTo(0, track.offsetTop + (track.scrollHeight - innerHeight) * value);
  }, progress);
  await page.waitForTimeout(120);
}

test("exports the complete corrected backend portfolio", async ({ page }) => {
  await openBackend(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("[data-backend-act]")).toHaveCount(11);
  await expect(page.locator(".bk-story__track")).toHaveAttribute("data-story-span", "1030");
  await expect(page.locator("#work-index")).toContainText("15 of 15 work records shown");
  await expect(page.locator("#work-index")).toContainText("Cloud-Hack — Containerized Blogging Microservices");
  await expect(page.locator("#research-teaching")).toContainText("656 learners");
  await expect(page.locator("#systems")).toContainText("Optical Software Development Engineer II");
  await expect(page.getByRole("link", { name: /résumé/i }).first()).toHaveAttribute("href", "/resume/Yashas-Kadambi-Resume.pdf");
});

test("keeps one large sticky visual and reverses the control-plane session", async ({ page }) => {
  await openBackend(page);
  await expect(page.locator(".bk-stage")).toHaveCSS("position", "sticky");
  const visual = await page.locator(".bk-stage__visual").boundingBox();
  expect(visual?.width ?? 0).toBeGreaterThanOrEqual(640);
  expect(visual?.height ?? 0).toBeGreaterThanOrEqual(560);

  const positions: string[] = [];
  for (const progress of [0.25, 0.37, 0.25]) {
    await setProgress(page, progress);
    positions.push(await page.locator(".bk-session__rail span").getAttribute("style") ?? "");
  }
  expect(positions[0]).toBe(positions[2]);
  expect(positions[0]).not.toBe(positions[1]);
});

test("communicates every act at its midpoint", async ({ page }) => {
  await openBackend(page);
  const samples = [
    [0.05, "inspect difference"],
    [0.16, "The boundary changes. The reasoning persists."],
    [0.31, "dependency plan"],
    [0.465, "One write becomes two independent regional paths."],
    [0.595, "Observation changes the live path."],
    [0.72, "Preserve what matches. Change only what diverged."],
    [0.98, "Current and desired state align."],
  ] as const;
  for (const [progress, phrase] of samples) {
    await setProgress(page, progress);
    await expect(page.locator(".bk-session svg")).toContainText(phrase);
  }
});

test("each flagship explanation resolves into the shared real demo", async ({ page }) => {
  await openBackend(page);
  const samples = [
    ["cloud", 0.79, 0.805],
    ["bitcoin", 0.831, 0.85],
    ["multiview", 0.876, 0.895],
    ["swift", 0.921, 0.94],
  ] as const;

  for (const [id, explain, prove] of samples) {
    await setProgress(page, explain);
    await expect(page.locator(".bk-stage__visual")).toHaveAttribute("data-project-phase", "explain");
    await setProgress(page, prove);
    await expect(page.locator(`[data-project-demo="${id}"]`)).toBeVisible();
    await expect(page.locator(`[data-project-demo="${id}"] [data-shared-project-lab="${id}"]`)).toBeVisible();
  }

  await expect(page.locator('a[href^="/demos"]')).toHaveCount(0);

  await setProgress(page, 0.805);
  await page.getByRole("button", { name: "Replay explanation" }).click();
  await expect(page.getByRole("button", { name: "Resolve into live demo" })).toBeVisible();
  await page.getByRole("button", { name: "Resolve into live demo" }).click();
  await expect(page.locator('[data-project-demo="cloud"] [data-shared-project-lab="cloud"]')).toBeVisible();

  const before = await page.evaluate(() => scrollY);
  await page.locator("[data-demo-scroll-pass-through]").hover();
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before);
  expect(await page.locator(".bk-project-demo *").evaluateAll((nodes) => nodes.filter((node) => {
    const style = getComputedStyle(node);
    return ["auto", "scroll"].includes(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
  }).length)).toBe(0);
});

for (const viewport of viewports) {
  test(`has no page overflow and preserves a meaningful visual at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await openBackend(page, viewport.width, viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    if (viewport.width < 1024) {
      await expect(page.locator("#overview .bk-static-plane")).toBeVisible();
      const box = await page.locator("#overview .bk-static-plane").boundingBox();
      expect(box?.y ?? Infinity).toBeLessThan(viewport.height);
    } else {
      await expect(page.locator(".bk-stage__visual")).toBeVisible();
    }
  });
}

test("reduced motion renders every resolved act and every real project lab in normal flow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openBackend(page, 360, 800);
  await expect(page.locator(".bk-stage")).toBeHidden();
  await expect(page.locator(".bk-static-plane:visible")).toHaveCount(11);
  await expect(page.locator(".bk-mobile-project-labs [data-demo-handoff]")).toHaveCount(4);
  for (const id of ["cloud", "bitcoin", "multiview", "swift"]) {
    const handoff = page.locator(`[data-demo-handoff="${id}"]`);
    await handoff.scrollIntoViewIfNeeded();
    await expect(handoff.locator(`[data-shared-project-lab="${id}"]`)).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("passes an automated accessibility scan", async ({ page }) => {
  await openBackend(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
