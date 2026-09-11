import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000";
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1180, height: 800 },
  { width: 1181, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "load", timeout: 60_000 });
    await page.waitForSelector("#rescued[data-ring-hydrated]", { timeout: 30_000 });

    const section = page.locator("#rescued");
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => [...document.querySelectorAll(".ring-portrait img")].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
      undefined,
      { timeout: 60_000 },
    );

    const scrollGeometry = await section.evaluate((element) => ({
      top: element.getBoundingClientRect().top + window.scrollY,
      travel: element.getBoundingClientRect().height - window.innerHeight,
    }));
    const phases = viewport.width > 1180 ? [0.52, 0.7, 0.9] : [null];

    for (const phase of phases) {
      if (phase === null) {
        await page.evaluate((top) => window.scrollTo(0, top), scrollGeometry.top);
      } else {
        await page.evaluate(
          ({ top, travel, phase }) => window.scrollTo(0, Math.round(top + travel * phase)),
          { ...scrollGeometry, phase },
        );
      }
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => {
        const orbit = document.querySelector(".ring-orbit");
        const portrait = document.querySelector(".ring-portrait");
        const copy = document.querySelector(".ring-center__copy");
        assertElement(orbit, ".ring-orbit");
        assertElement(portrait, ".ring-portrait");
        assertElement(copy, ".ring-center__copy");

        const path = getComputedStyle(portrait).offsetPath;
        const probes = Array.from({ length: 360 }, (_, index) => {
          const probe = document.createElement("i");
          Object.assign(probe.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "0",
            height: "0",
            offsetPath: path,
            offsetDistance: `${(index / 360) * 100}%`,
            offsetRotate: "0deg",
          });
          orbit.append(probe);
          return probe;
        });

        const points = probes.map((probe) => {
          const box = probe.getBoundingClientRect();
          return { x: box.left, y: box.top };
        });
        probes.forEach((probe) => probe.remove());

        const copyBox = copy.getBoundingClientRect();
        const pathCenter = {
          x: (Math.min(...points.map((point) => point.x)) + Math.max(...points.map((point) => point.x))) / 2,
          y: (Math.min(...points.map((point) => point.y)) + Math.max(...points.map((point) => point.y))) / 2,
        };
        const copyCenter = {
          x: copyBox.left + copyBox.width / 2,
          y: copyBox.top + copyBox.height / 2,
        };

        return {
          pathCenter,
          copyCenter,
          delta: {
            x: Math.abs(pathCenter.x - copyCenter.x),
            y: Math.abs(pathCenter.y - copyCenter.y),
          },
          portraitCount: document.querySelectorAll(".ring-portrait").length,
        };

        function assertElement(element, selector) {
          if (!element) throw new Error(`${selector} not found`);
        }
      });

      console.log(`${viewport.width}x${viewport.height} phase=${phase ?? "compact"}`, metrics);
      assert.equal(metrics.portraitCount, 11, `${viewport.width}px: all eleven animals must remain`);
      assert.ok(
        metrics.delta.x < 2 && metrics.delta.y < 2,
        `${viewport.width}px phase ${phase ?? "compact"}: text misses the orbit centre by ${metrics.delta.x.toFixed(1)}px x ${metrics.delta.y.toFixed(1)}px`,
      );
    }

    await context.close();
  }
} finally {
  await browser.close();
}
