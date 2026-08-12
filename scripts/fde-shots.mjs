// Scroll-position screenshots for /fde verification. Not part of the build.
// usage: node scripts/fde-shots.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3001";
const out = "/tmp/fde-shots";
mkdirSync(out, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// The page has two complete themes; both are shot. `theme` is what the site's
// toggle persists (see src/lib/useTheme.ts).
const themes = ["light", "dark"];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
];

// fractions of the scrollable height
const marks = [0, 0.11, 0.23, 0.32, 0.42, 0.55, 0.68, 0.8, 0.95];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const errors = [];

for (const theme of themes)
for (const vp of viewports) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`${theme}/${vp.name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${theme}/${vp.name} console: ${m.text()}`));
  await page.setViewport(vp);
  await page.evaluateOnNewDocument((t) => localStorage.setItem("theme", t), theme);
  await page.goto(`${base}/fde/`, { waitUntil: "networkidle0" });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) errors.push(`${theme}/${vp.name}: horizontal overflow ${overflow}px`);

  for (const m of marks) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
    }, m);
    await new Promise((r) => setTimeout(r, 450));
    await page.screenshot({ path: `${out}/${theme}-${vp.name}-${String(m).replace(".", "_")}.png` });
  }

  // reverse scroll sanity: back to the top and to an earlier scene
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${out}/${theme}-${vp.name}-reverse-top.png` });
  await page.close();
}

// reduced motion fallback
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.setViewport({ width: 1440, height: 900 });
await rm.goto(`${base}/fde/`, { waitUntil: "networkidle0" });
await rm.screenshot({ path: `${out}/reduced-motion.png`, fullPage: false });
await rm.evaluate(() => window.scrollTo(0, 2400));
await new Promise((r) => setTimeout(r, 400));
await rm.screenshot({ path: `${out}/reduced-motion-2.png` });
await rm.close();

await browser.close();
console.log(errors.length ? `ISSUES:\n${errors.join("\n")}` : "no console/page errors, no overflow");
