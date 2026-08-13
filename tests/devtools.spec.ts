import { expect, test } from "@playwright/test";

test("keeps the desktop inspector pinned while the portfolio scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/devtools/", { waitUntil: "networkidle" });

  const inspector = page.locator(".dv-stage-rail");
  await expect(inspector).toBeVisible();

  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));

  const position = await inspector.evaluate((element) => ({
    expectedTop: Number.parseFloat(getComputedStyle(element).top),
    actualTop: element.getBoundingClientRect().top,
  }));

  expect(Math.abs(position.actualTop - position.expectedTop)).toBeLessThanOrEqual(1);
  await expect(inspector).toBeInViewport();
});

test("renders every verified project preview open by default", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/devtools/", { waitUntil: "networkidle" });

  const previews = page.locator('section[id^="inspect-"]');
  await expect(previews).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Open live lab" })).toHaveCount(0);

  const ids = await previews.evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(10);
  for (const id of ["cloud", "ghost", "swift", "multiview", "bitcoin", "chocollvm", "cifar", "yelp", "parallel", "petra"]) {
    await expect(page.locator(`#inspect-${id} [data-demo-lab-root]`)).toHaveCount(1);
  }
});

test("keeps the default-open preview document within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/devtools/", { waitUntil: "networkidle" });
  await page.locator("#inspect-petra").scrollIntoViewIfNeeded();

  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await expect(page.locator('#inspect-petra [data-shared-project-lab="petra"]')).toBeVisible();
});
