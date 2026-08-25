import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3100/", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(4000);
const r = await page.evaluate(() => new Promise((res) => {
  const entries = [];
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) entries.push({ t: Math.round(e.startTime), size: e.size, tag: e.element?.tagName, txt: (e.element?.textContent || "").slice(0, 30) }); })
      .observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) { return res({ err: String(e) }); }
  setTimeout(() => {
    const paints = performance.getEntriesByType("paint").map(p => ({ name: p.name, t: Math.round(p.startTime) }));
    const h1 = document.querySelector("h1");
    const cs = h1 ? getComputedStyle(h1) : null;
    res({ entries, paints, h1: h1 ? { text: h1.textContent.trim().slice(0,20), opacity: cs.opacity, filter: cs.filter, rect: h1.getBoundingClientRect().height } : null });
  }, 600);
}));
console.log(JSON.stringify(r, null, 1));
await browser.close();
