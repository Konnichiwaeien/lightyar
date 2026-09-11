import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce" },
];

const center = (rect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: viewport.reducedMotion || "no-preference",
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.goto(baseUrl, { waitUntil: "load", timeout: 60_000 });
    const section = page.locator("#needs");
    await section.waitFor({ state: "attached", timeout: 30_000 });
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const objects = page.locator(".wishlist-object");
    assert.equal(await objects.count(), 3, `${viewport.name}: expected three orbiting objects`);

    const before = (await objects.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    )).map(center);

    await page.waitForTimeout(1_000);

    const after = (await objects.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    )).map(center);

    const movement = before.map((point, index) => distance(point, after[index]));
    if (viewport.reducedMotion) {
      assert.ok(
        movement.every((value) => value < 1),
        `${viewport.name}: wishlist orbit moves despite reduced motion (${movement.map((value) => value.toFixed(1)).join(", ")}px)`,
      );
    } else {
      assert.ok(
        movement.every((value) => value >= 8),
        `${viewport.name}: wishlist orbit is static (${movement.map((value) => value.toFixed(1)).join(", ")}px movement)`,
      );
    }
    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors: ${pageErrors.join(" | ")}`);

    console.log(`${viewport.name}: orbit movement ${movement.map((value) => value.toFixed(1)).join(", ")}px`);
    await context.close();
  }
} finally {
  await browser.close();
}
