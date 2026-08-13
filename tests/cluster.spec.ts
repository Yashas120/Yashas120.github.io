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
  await expect(page.locator("#systems-evidence [data-editorial-evidence-row]")).toHaveCount(4);
  await expect(page.locator("#research article")).toHaveCount(2);
  await expect(page.locator("#teaching li")).toHaveCount(3);
  await expect(page.locator("#education article")).toHaveCount(2);
  await expect(page.locator("#complete-project-index")).toContainText("Every project has a provenance. Every claim states its boundary.");
  await expect(page.getByRole("link", { name: /Résumé, PDF, 2 pages/ }).first()).toHaveAttribute("href", "/resume/Yashas-Kadambi-Resume.pdf");
  await expect(page.getByRole("link", { name: "View production systems" })).toHaveAttribute("href", "#regional-consequences");

  for (const text of ["About three years at Cisco", "Incoming M.S. Computer Science", "This is my complete engineering portfolio"]) {
    const box = await page.getByText(text, { exact: false }).first().boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 1000) + (box?.height ?? 1000)).toBeLessThanOrEqual(720);
  }
});

test("renders the grouped evidence ledger in the required order without demo deep-links", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const index = page.locator("#complete-project-index");
  const groups = index.locator("[data-evidence-group-section]");
  await expect(groups).toHaveCount(7);
  expect(await groups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-evidence-group-section")))).toEqual([
    "professional-systems",
    "systems",
    "research",
    "product",
    "professional-tools",
    "repository-context",
    "evidence-pending",
  ]);
  expect(await groups.locator(":scope > header h3").allInnerTexts()).toEqual([
    "Selected production mechanisms",
    "Systems, infrastructure, and protocols",
    "Research, ML, and computer vision",
    "Compilers, data, and product systems",
    "Professional prototypes and internal tools",
    "Repository context",
    "Evidence pending",
  ]);
  await expect(index.locator("[data-project-evidence-item]")).toHaveCount(26);
  await expect(index.locator('[href^="/demos"], [href*="#project-"]')).toHaveCount(0);
  await expect(index).not.toContainText(/Name \/ description|Contribution \/ status|Domain \/ evidence|Unknown\/requires verification|Archived/);
});

test("orders systems and professional tools by attribution strength and role relevance", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const titles = async (group: string) => page.locator(`[data-evidence-group-section="${group}"] [data-project-evidence-item] h4`).allInnerTexts();
  expect(await titles("systems")).toEqual([
    "Bitcoin Transactions in Java",
    "Cloud-Hack",
    "Spark Streaming for Machine Learning",
    "Cloud Provisioning using RDBMS",
    "SSP",
  ]);
  expect(await titles("professional-tools")).toEqual([
    "Schneider Decision Tool",
    "Group-aware RAG Assistant PoC",
    "Engineering Analytics Dashboard",
    "AWS Glue Data Path",
    "Performance-Monitoring Log Analyzer",
    "CX Agent Side Panel",
  ]);
});

test("keeps provenance axes separate and resolves evidence links", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const index = page.locator("#complete-project-index");
  const items = index.locator("[data-project-evidence-item]");
  await expect(items.locator("dl dt")).toHaveCount(26 * 5);
  await expect(items.locator("dl dd")).toHaveCount(26 * 5);
  await expect(index.getByText("Independent", { exact: true }).first()).toBeVisible();
  await expect(index.getByText("Collaborative", { exact: true }).first()).toBeVisible();
  await expect(index.getByText("Public fork", { exact: true }).first()).toBeVisible();

  const internalLinks = index.locator('a[href^="#experience-"]');
  await expect(internalLinks).toHaveCount(11);
  for (const href of await internalLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  const externalLinks = index.locator('a[href^="http"]');
  await expect(externalLinks).toHaveCount(15);
  for (const link of await externalLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer noopener/);
  }
});

test("keeps the ghOSt study inside the evidence-pending boundary", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const pending = page.locator('[data-project-evidence-item="ghost-scheduler-study"]');
  await expect(pending).toContainText("A scheduler-performance study centered on Google ghOSt.");
  await expect(pending).toContainText("No public report currently available.");
  await expect(pending).not.toContainText(/CFS|FIFO|Shinjuku|RocksDB|completed|result/i);
  await expect(pending.locator("a")).toHaveCount(0);
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
    await track.evaluate((element, value) => scrollTo(0, (element as HTMLElement).offsetTop + (element.scrollHeight - innerHeight) * value), progress);
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

test("keeps every chapter visible at its midpoint inside the same pinned stage", async ({ page }) => {
  await openCluster(page, 1280, 720, "light");
  const track = page.locator('[data-enhanced="true"]');
  const stage = track.locator(":scope > div");
  const samples = [
    ["identity", 0.0556],
    ["regional-consequences", 0.1833],
    ["change-safely", 0.3944],
    ["reconcile-state", 0.6111],
    ["public-systems-evidence", 0.7778],
    ["story-handoff", 0.9333],
  ] as const;

  for (const [id, progress] of samples) {
    await track.evaluate((element, value) => scrollTo(0, (element as HTMLElement).offsetTop + (element.scrollHeight - innerHeight) * value), progress);
    await page.waitForTimeout(70);
    await expect(page.locator(`[data-story-scene="${id}"]`)).toHaveCSS("visibility", "visible");
    expect(Number(await page.locator(`[data-story-scene="${id}"]`).evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0.9);
    const stageBox = await stage.boundingBox();
    expect(Math.abs(stageBox?.y ?? 999)).toBeLessThanOrEqual(1);
  }
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
