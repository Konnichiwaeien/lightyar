import { chromium } from "playwright-core";
const paths = process.argv.slice(2).map(a => (a === "home" ? "/" : a.startsWith("/") ? a : "/" + a));
const browser = await chromium.launch({ channel: "chrome" });
for (const p of paths) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3100${p}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => new Promise((res) => {
    let last = null;
    new PerformanceObserver((l) => { const e = l.getEntries(); last = e[e.length - 1]; })
      .observe({ type: "largest-contentful-paint", buffered: true });
    setTimeout(() => res({ lcp: Math.round(last?.startTime || 0), tag: last?.element?.tagName || "?", text: (last?.element?.textContent || last?.element?.currentSrc || "").slice(0, 40) }), 400);
  }));
  console.log(`${p.padEnd(14)} LCP ${String(r.lcp).padStart(5)}мс  ${r.tag}  ${r.text}`);
  await ctx.close();
}
await browser.close();
