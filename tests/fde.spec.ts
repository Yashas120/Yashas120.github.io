import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const widths = [360, 768, 1280, 1536] as const;
const range = (prefix: string, end: number) => Array.from({ length: end }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`);
const canonicalEvidenceIds = [...range("PE", 22), ...range("PR", 18), ...range("RS", 2), ...range("TE", 3), ...range("ED", 2), ...range("AW", 6), ...range("CP", 10), ...range("LK", 6)];
const excludedEvidenceIds = new Set(["PR-15", "PR-16", "PR-17", "PR-18", "AW-01", "AW-03", "LK-04"]);

async function openFde(page: Page, width = 1280, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto("/fde/", { waitUntil: "networkidle" });
  await expect(page.locator(".fde-root")).toBeVisible();
}

test("renders the complete verified record and honest actions", async ({ page }) => {
  await openFde(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#professional-record article")).toHaveCount(5);
  await expect(page.locator('[data-fde-scene="01"]')).toContainText("THE DEPLOYMENT DOSSIER");
  await expect(page.locator("#featured-systems article")).toHaveCount(4);
  await expect(page.locator("#work-index article")).toHaveCount(14);
  await expect(page.getByText("Toward Faster and Efficient Lightweight Image Super-Resolution Using Transformers and Fourier Convolutions", { exact: true })).toBeVisible();
  await expect(page.getByText("Monitoring and Alert Systems for Underwater Data Centers using Arduino", { exact: true })).toBeVisible();
  await expect(page.locator("#teaching")).toContainText("656");
  await expect(page.locator("#teaching")).toContainText("122 learners");
  await expect(page.locator("#teaching")).toContainText("494 learners");
  await expect(page.locator("#teaching")).toContainText("~40 learners");
  await expect(page.locator("#education")).toContainText("starting Sep 2026");
  await expect(page.getByRole("link", { name: /LinkedIn/ }).first()).toHaveText("LinkedIn");
  await expect(page.getByRole("link", { name: "Resume", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
});

test("renders every public evidence ID and excludes only reasoned held records", async ({ page }) => {
  await openFde(page);
  const rendered = new Set(await page.locator("[data-evidence-id], [data-evidence-ids]").evaluateAll((nodes) =>
    nodes.flatMap((node) => [node.getAttribute("data-evidence-id") ?? "", node.getAttribute("data-evidence-ids") ?? ""])
      .flatMap((value) => value.split(/\s+/)).filter(Boolean)
  ));
  expect(canonicalEvidenceIds.filter((id) => !excludedEvidenceIds.has(id) && !rendered.has(id))).toEqual([]);
});

test("uses one reversible pinned film with one dominant scene", async ({ page }) => {
  await openFde(page, 1280, 900);
  const track = page.locator(".fde-stage-track");
  await expect(track).toHaveAttribute("data-scene-count", "11");
  await expect(track.locator(":scope > .sticky")).toHaveCount(1);

  const sample = async (index: number) => {
    await page.evaluate((sceneIndex) => {
      const element = document.querySelector<HTMLElement>(".fde-stage-track");
      if (!element) throw new Error("Missing stage");
      const travel = element.offsetHeight - innerHeight;
      scrollTo(0, element.offsetTop + travel * ((sceneIndex + 0.5) / 11));
    }, index);
    await page.waitForTimeout(100);
    const dominant = await page.locator("[data-fde-scene]").evaluateAll((nodes) => nodes.filter((node) => Number(getComputedStyle(node).opacity) > 0.7).map((node) => node.getAttribute("data-fde-scene")));
    expect(dominant).toEqual([String(index + 1).padStart(2, "0")]);
  };

  for (const index of [0, 2, 4, 6, 8, 10]) await sample(index);
  for (const index of [9, 7, 5, 3, 1, 0]) await sample(index);
});

test("releases the sticky stage directly into the verified annex", async ({ page }) => {
  await openFde(page, 1280, 900);
  const structure = await page.evaluate(() => {
    const stage = document.querySelector(".fde-stage-track");
    const next = stage?.nextElementSibling;
    return { nextClass: next?.className ?? "", nextFirstId: next?.firstElementChild?.id ?? "" };
  });
  expect(structure.nextClass).toContain("fde-annex");
  expect(structure.nextFirstId).toBe("evidence-index");
  await expect(page.locator("#public-labs")).toHaveCount(1);
});

test("runs the public labs inside the dossier", async ({ page }) => {
  await openFde(page, 1280, 900);
  const labs = page.locator("#public-labs");
  await labs.scrollIntoViewIfNeeded();
  for (const id of ["ghost", "bitcoin", "chocollvm", "swift", "multiview", "cifar", "parallel", "cloud", "yelp", "petra"]) {
    await expect(labs.locator(`[data-demo-handoff="${id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('a[href^="/demos"], a[href*="yashas120.github.io/demos"]')).toHaveCount(0);
  await expect(page.locator('a[href="#public-labs"]')).toHaveCount(0);
  const ghostLab = labs.locator('[data-demo-handoff="ghost"]');
  await ghostLab.scrollIntoViewIfNeeded();
  await ghostLab.getByRole("button", { name: "Open live lab" }).click();
  await expect(labs.locator('[data-shared-project-lab="ghost"]')).toBeVisible();
});

test("uses literal vertical mechanisms on compact scenes", async ({ page }) => {
  await openFde(page, 360, 1024);
  for (const [scene, label] of [["02", "EXPECTED BEHAVIOR"], ["03", "DEPLOYMENT + HANDOFF"], ["04", "OWNER MAPPED"], ["05", "BLOCKED UNTIL HEALTHY"], ["08", "GENERATED + PUBLISHED SDKS"], ["09", "PROOF OF CONCEPT · HUMAN CONTROLLED"]] as const) {
    expect(await page.locator(`[data-fde-scene="${scene}"] svg text`).filter({ hasText: label }).count()).toBeGreaterThanOrEqual(1);
  }
});

test("exposes a visible skip link and lands below the integrated header", async ({ page }) => {
  await openFde(page, 1280, 900);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to verified record" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#evidence-index$/);
  const landing = await page.evaluate(() => ({
    targetTop: document.querySelector("#evidence-index")?.getBoundingClientRect().top ?? -1,
    headerBottom: document.querySelector(".fde-header")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(landing.targetTop).toBeGreaterThanOrEqual(landing.headerBottom);
});

for (const width of widths) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await openFde(page, width, width < 800 ? 1024 : 900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const clippedScenes = await page.locator("[data-fde-copy-pane]").evaluateAll((panes) =>
      panes.filter((pane) => pane.scrollHeight > pane.clientHeight + 1).map((pane) => pane.parentElement?.getAttribute("data-fde-scene"))
    );
    expect(clippedScenes).toEqual([]);
    await page.locator("#evidence-index").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("reduced motion resolves all scenes into normal flow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFde(page, 768, 1024);
  await expect(page.locator("[data-fde-reduced-motion] > section")).toHaveCount(11);
  await expect(page.locator("[data-fde-reduced-motion] [data-fde-static-context]")).toHaveCount(11);
  await expect(page.locator(".fde-stage-track")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("passes an automated accessibility scan", async ({ page }) => {
  await openFde(page, 1280, 900);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
