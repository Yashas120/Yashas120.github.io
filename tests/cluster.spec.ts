import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const viewports = [360, 768, 1280, 1536] as const;

async function openCluster(page: Page, width = 1280, height = 900, mode: "light" | "dark" = "dark") {
  await page.setViewportSize({ width, height });
  await page.addInitScript((theme) => localStorage.setItem("cluster-theme", theme), mode);
  await page.goto("/cluster/", { waitUntil: "networkidle" });
  await expect(page.locator("#cluster-main")).toBeVisible();
}

test("renders the complete public record with one production-first H1", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("I make coordinated systems safer to change.");
  await expect(page.locator("#experience article")).toHaveCount(4);
  await expect(page.locator("#systems-evidence > div > article")).toHaveCount(4);
  await expect(page.locator("#research article")).toHaveCount(2);
  await expect(page.locator("#teaching li")).toHaveCount(3);
  await expect(page.locator("#education article")).toHaveCount(2);
  await expect(page.locator("#complete-project-index")).toContainText("Every substantive project, with provenance.");
  await expect(page.getByRole("link", { name: /Résumé, PDF, 2 pages/ }).first()).toHaveAttribute("href", "/resume/Yashas-Kadambi-Resume.pdf");
  await expect(page.getByRole("link", { name: "View production systems" })).toHaveAttribute("href", "#regional-consequences");

  for (const text of ["About three years at Cisco", "Incoming M.S. Computer Science", "This is my complete engineering portfolio"]) {
    const box = await page.getByText(text, { exact: false }).first().boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 1000) + (box?.height ?? 1000)).toBeLessThanOrEqual(720);
  }
});

test("uses exactly six canonical chapters totaling 900svh", async ({ page }) => {
  await openCluster(page);
  await expect(page.locator("[data-total-span]" )).toHaveAttribute("data-total-span", "900");
  await expect(page.locator('[data-enhanced="true"] > div')).toHaveCount(1);
  await expect(page.locator('[data-enhanced="true"] > div')).toHaveCSS("position", "sticky");
  const spans = await page.locator("[data-scene-span]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-scene-span"))));
  expect(spans).toEqual([100, 130, 250, 140, 160, 120]);
  expect(spans.reduce((sum, span) => sum + span, 0)).toBe(900);
});

test("keeps one sticky stage while left copy enters, holds, and exits", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const track = page.locator('[data-enhanced="true"]');
  const travel = await track.evaluate((element) => element.scrollHeight - innerHeight);
  const sample = async (progress: number) => {
    await track.evaluate((element, value) => scrollTo(0, element.offsetTop + (element.scrollHeight - innerHeight) * value), progress);
    await page.waitForTimeout(80);
    return page.locator('[data-scene-copy="regional-consequences"]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { opacity: Number(style.opacity), transform: style.transform };
    });
  };

  expect(travel).toBeGreaterThan(5000);
  const before = await sample(0.112);
  const held = await sample(0.19);
  const exiting = await sample(0.247);
  expect(before.opacity).toBeLessThan(held.opacity);
  expect(held.opacity).toBeGreaterThan(0.9);
  expect(exiting.opacity).toBeLessThan(held.opacity);
  expect(before.transform).not.toBe(held.transform);
  expect(exiting.transform).not.toBe(held.transform);
});

for (const width of viewports) {
  for (const mode of ["dark", "light"] as const) {
    test(`has no overflow, undersized controls, or axe violations at ${width}px in ${mode} mode`, async ({ page }) => {
      await openCluster(page, width, width === 360 ? 800 : 900, mode);
      const layout = await page.evaluate(() => {
        const root = document.querySelector("main")?.parentElement;
        const smallTargets = [...(root?.querySelectorAll("a,button") ?? [])].filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        }).length;
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallTargets,
        };
      });
      expect(layout).toEqual({ overflow: 0, smallTargets: 0 });
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("reduced motion uses ordinary flow and retains the complete story", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openCluster(page, 1280, 720);
  await expect(page.locator("[data-scene-span]")).toHaveCount(6);
  await expect(page.locator("#complete-profile")).toBeVisible();
  const firstHeight = await page.locator("[data-scene-span]").first().evaluate((element) => element.getBoundingClientRect().height);
  expect(firstHeight).toBeGreaterThan(720);
  expect(firstHeight).toBeLessThan(1600);
});

test("hydration keeps the sticky track and story anchors stable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/cluster/", { waitUntil: "domcontentloaded" });
  const before = await page.evaluate(() => ({
    trackHeight: document.querySelector<HTMLElement>("[data-total-span] > div")?.offsetHeight ?? 0,
    filmBottom: document.querySelector<HTMLElement>("[data-total-span]")?.getBoundingClientRect().bottom ?? 0,
  }));
  await page.waitForTimeout(750);
  const after = await page.evaluate(() => ({
    trackHeight: document.querySelector<HTMLElement>("[data-total-span] > div")?.offsetHeight ?? 0,
    filmBottom: document.querySelector<HTMLElement>("[data-total-span]")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(Math.abs(after.trackHeight - before.trackHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.filmBottom - before.filmBottom)).toBeLessThanOrEqual(1);
});

test("no-JavaScript rendering retains story, profile, and contact", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto("/cluster/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("[data-scene-span]")).toHaveCount(6);
  await expect(page.locator("#complete-profile")).toHaveCount(1);
  await expect(page.locator("#contact")).toHaveCount(1);
  await context.close();
});
