// Scroll-position screenshots for /backend verification. Not part of the build.
// usage: node scripts/backend-shots.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = "/tmp/backend-shots";
mkdirSync(out, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// the widths the redesign is required to hold
const viewports = [
  { name: "w1536", width: 1536, height: 960 },
  { name: "w1280", width: 1280, height: 800 },
  { name: "w768", width: 768, height: 1024 },
  { name: "w360", width: 360, height: 800, isMobile: true, deviceScaleFactor: 2 },
];

// one mark inside each chapter's hold window, plus the two project substates
const marks = [0, 0.06, 0.19, 0.35, 0.52, 0.68, 0.8, 0.87, 0.96, 1];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const errors = [];

for (const vp of viewports) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp.name} console: ${m.text()}`));
  await page.setViewport(vp);
  await page.goto(`${base}/backend/`, { waitUntil: "networkidle0" });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) errors.push(`${vp.name}: horizontal overflow ${overflow}px`);

  for (const m of marks) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
    }, m);
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: `${out}/${vp.name}-${String(m).replace(".", "_")}.png` });
    const o = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (o > 0) errors.push(`${vp.name} @${m}: horizontal overflow ${o}px`);
  }

  // reverse scroll sanity: the film must be reversible
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${out}/${vp.name}-reverse-top.png` });
  await page.close();
}

// keyboard: tab order and visible focus on the header actions
const kb = await browser.newPage();
await kb.setViewport({ width: 1280, height: 800 });
await kb.goto(`${base}/backend/`, { waitUntil: "networkidle0" });
const tabOrder = [];
for (let i = 0; i < 8; i++) {
  await kb.keyboard.press("Tab");
  tabOrder.push(
    await kb.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "none";
      const s = getComputedStyle(el);
      return `${el.tagName}:${(el.textContent ?? "").trim().slice(0, 28)} outline=${s.outlineWidth} ${s.outlineStyle}`;
    })
  );
}
await kb.screenshot({ path: `${out}/keyboard-focus.png` });
await kb.close();

// reduced motion: the resolved, stacked document
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.setViewport({ width: 1280, height: 800 });
await rm.goto(`${base}/backend/`, { waitUntil: "networkidle0" });
for (const y of [0, 900, 2200, 3600, 5200]) {
  await rm.evaluate((v) => window.scrollTo(0, v), y);
  await new Promise((r) => setTimeout(r, 700));
  await rm.screenshot({ path: `${out}/reduced-${y}.png` });
}
await rm.close();

await browser.close();
console.log("tab order:\n" + tabOrder.join("\n"));
console.log(errors.length ? `\nISSUES:\n${errors.join("\n")}` : "\nno console/page errors, no overflow");
