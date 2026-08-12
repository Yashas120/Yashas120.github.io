// Scroll-position screenshots for /data-plane verification. Not part of the build.
// usage: node scripts/dataplane-shots.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = "/tmp/dp-shots";
mkdirSync(out, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// the widths the redesign is required to hold
const viewports = [
  { name: "w1536", width: 1536, height: 960 },
  { name: "w1280", width: 1280, height: 800 },
  { name: "w768", width: 768, height: 1024 },
  { name: "w360", width: 360, height: 780, isMobile: true, deviceScaleFactor: 2 },
];

// Dense enough to land inside each of the nine film chapters at least once.
const marks = Array.from({ length: 25 }, (_, i) => Math.round((i / 24) * 100) / 100);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const errors = [];

for (const vp of viewports) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp.name} console: ${m.text()}`));
  await page.setViewport(vp);
  await page.goto(`${base}/data-plane/`, { waitUntil: "networkidle0" });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) errors.push(`${vp.name}: horizontal overflow ${overflow}px`);

  for (const m of marks) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
    }, m);
    await new Promise((r) => setTimeout(r, 420));
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
await kb.goto(`${base}/data-plane/`, { waitUntil: "networkidle0" });
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

// reduced motion: the resolved, stacked document, at desktop and phone widths
for (const rvp of [
  { tag: "d", width: 1280, height: 800 },
  { tag: "m", width: 360, height: 780, isMobile: true, deviceScaleFactor: 2 },
]) {
  const rm = await browser.newPage();
  rm.on("pageerror", (e) => errors.push(`reduced-${rvp.tag}: ${e.message}`));
  await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await rm.setViewport(rvp);
  await rm.goto(`${base}/data-plane/`, { waitUntil: "networkidle0" });
  const ro = await rm.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (ro > 0) errors.push(`reduced-${rvp.tag}: horizontal overflow ${ro}px`);
  for (const y of [0, 900, 2200, 3600, 5200]) {
    await rm.evaluate((v) => window.scrollTo(0, v), y);
    await new Promise((r) => setTimeout(r, 350));
    await rm.screenshot({ path: `${out}/reduced-${rvp.tag}-${y}.png` });
  }
  await rm.close();
}

await browser.close();
console.log("tab order:\n" + tabOrder.join("\n"));
console.log(errors.length ? `\nISSUES:\n${errors.join("\n")}` : "\nno console/page errors, no overflow");
