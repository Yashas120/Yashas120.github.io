import { expect, test } from "@playwright/test";

test("keeps the desktop inspector pinned while the portfolio scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/devtools/", { waitUntil: "networkidle" });

  const inspector = page.locator('aside[aria-label="Delivery system inspector"] > .sticky');
  await expect(inspector).toBeVisible();

  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));

  const position = await inspector.evaluate((element) => ({
    expectedTop: Number.parseFloat(getComputedStyle(element).top),
    actualTop: element.getBoundingClientRect().top,
  }));

  expect(Math.abs(position.actualTop - position.expectedTop)).toBeLessThanOrEqual(1);
  await expect(inspector).toBeInViewport();
});
