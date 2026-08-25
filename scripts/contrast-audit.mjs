/** Проверяет контраст текста на всех маршрутах, пропуская текст поверх фотографий */
import { chromium } from "playwright-core";

const PAGES = ["/", "/about", "/pets", "/campaigns", "/news", "/reports", "/reports/2024"];
const browser = await chromium.launch({ channel: "chrome" });
let totalBad = 0;

for (const path of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3100${path}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);

  const bad = await page.evaluate(() => {
    const lum = (c) => {
      const m = c.match(/[\d.]+/g).map(Number);
      const f = m.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; const [hi, lo] = x > y ? [x, y] : [y, x]; return (hi + 0.05) / (lo + 0.05); };
    const solidBg = (el) => {
      let e = el;
      while (e && e !== document.documentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
        const c = cs.backgroundColor;
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) {
          const a = c.match(/[\d.]+/g);
          if (a.length > 3 && Number(a[3]) < 1) return null;
          return c;
        }
        e = e.parentElement;
      }
      return "rgb(232,228,220)";
    };
    const out = [];
    document.querySelectorAll("p,span,dt,dd,small,li,a,button,h1,h2,h3,b,em,strong").forEach((el) => {
      if (!el.textContent.trim()) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.opacity === "0") return;
      const bg = solidBg(el);
      if (!bg) return;
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const cr = ratio(cs.color, bg);
      if (cr < (large ? 3 : 4.5)) out.push({ t: el.textContent.trim().slice(0, 34), cr: cr.toFixed(2) });
    });
    return out;
  });

  totalBad += bad.length;
  console.log(`${path.padEnd(16)} провалов: ${String(bad.length).padStart(3)}${bad.length ? "  " + bad.slice(0, 2).map((b) => `«${b.t}» ${b.cr}`).join(" | ") : ""}`);
  await ctx.close();
}
await browser.close();
console.log(`\nВСЕГО: ${totalBad}`);
