import { chromium } from "playwright-core";
const [, , URL_, OUT, W, H] = process.argv;
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: Number(W || 1400), height: Number(H || 900) } });
await page.goto(URL_, { waitUntil: "load", timeout: 60_000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, fullPage: true });
console.log("снято:", OUT);
await browser.close();
