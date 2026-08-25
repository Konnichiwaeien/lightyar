import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
for (const [label, w, h] of [["мобильный", 390, 844], ["десктоп", 1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("ul.grid li")].filter((e) => /кураторстве|безопасности|жизней/i.test(e.textContent));
    return cards.map((c) => {
      const b = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return { w: Math.round(b.width), h: Math.round(b.height), dir: cs.flexDirection, icon: c.querySelectorAll("svg").length };
    });
  });
  console.log(`${label} ${w}px:`);
  r.forEach((c, i) => console.log(`  карточка ${i + 1}: ${c.w}×${c.h}, направление ${c.dir}, значков ${c.icon}`));
  await ctx.close();
}
await browser.close();
