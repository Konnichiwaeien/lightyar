import assert from "node:assert/strict";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000";
const viewportFilter = process.argv[3];
const allViewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-wide", width: 1920, height: 1080 },
  { name: "desktop-short", width: 1280, height: 720 },
  { name: "desktop-boundary", width: 1181, height: 800 },
  { name: "reduced-motion", width: 1440, height: 900, reducedMotion: "reduce", flow: true },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 700 },
];
const viewports = viewportFilter
  ? allViewports.filter((viewport) => viewport.name === viewportFilter)
  : allViewports;

assert.ok(viewports.length > 0, `unknown viewport filter: ${viewportFilter}`);

const overlaps = (a, b) =>
  Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
  Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: viewport.reducedMotion || "no-preference",
    });
    const page = await context.newPage();
    const pageErrors = [];
    const localAssetFailures = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.origin === baseUrl &&
        (url.pathname.startsWith("/pets/") || url.pathname.startsWith("/wishlist/")) &&
        response.status() >= 400
      ) {
        localAssetFailures.push(`${response.status()} ${url.pathname}`);
      }
    });

    await page.goto(baseUrl, { waitUntil: "load", timeout: 60_000 });
    const section = page.locator("#rescued");
    await section.waitFor({ state: "visible" });
    await page.waitForSelector("#rescued[data-ring-hydrated]", { timeout: 30_000 });
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelectorAll(".ring-portrait img").length >= 6,
    );
    await page.waitForFunction(
      () => [...document.querySelectorAll(".ring-portrait img")].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
      undefined,
      { timeout: 60_000 },
    );
    await page.waitForFunction(
      () => {
        const values = [...document.querySelectorAll(".ring-mark")].map(
          (element) => Number.parseInt(element.textContent || "0", 10),
        );
        return values[0] === 79 && values[1] === 72;
      },
      undefined,
      { timeout: 10_000 },
    );

    const sectionBox = await section.boundingBox();
    assert.ok(sectionBox, `${viewport.name}: #rescued has no box`);

    const sectionTop = await section.evaluate((element) =>
      Math.round(element.getBoundingClientRect().top + window.scrollY),
    );

    let desktopTravel = 0;
    let midGatherScales = [];
    let scatterMetrics = null;
    let orbitMetrics = null;
    let compactOrbitMotion = null;

    if (viewport.width > 900 && !viewport.flow) {
      const sectionHeight = await section.evaluate((element) => element.getBoundingClientRect().height);
      desktopTravel = sectionHeight - viewport.height;

      await page.evaluate(
        ({ top, travel }) => window.scrollTo(0, Math.round(top + travel * 0.02)),
        { top: sectionTop, travel: desktopTravel },
      );
      await page.waitForTimeout(250);
      scatterMetrics = await page.evaluate(() => {
        const matrixFor = (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform);
        const portraitElements = [...document.querySelectorAll(".ring-portrait")];
        const portraits = portraitElements.map(matrixFor);
        const center = matrixFor(document.querySelector(".ring-center"));
        const aside = matrixFor(document.querySelector(".ring-aside"));
        return {
          centerScale: Math.hypot(center.a, center.b),
          asideX: aside.e,
          visiblePortraits: portraitElements.filter((element) => {
            const box = element.getBoundingClientRect();
            return box.right > 0 && box.left < innerWidth && box.bottom > 0 && box.top < innerHeight;
          }).length,
          portraitRects: portraitElements.map((element) => {
            const box = element.getBoundingClientRect();
            return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
          }),
          portraitTranslations: portraits.map((matrix) => Math.hypot(matrix.e, matrix.f)),
          portraitScales: portraits.map((matrix) => Math.hypot(matrix.a, matrix.b)),
        };
      });
      console.log(`${viewport.name} scatter metrics`, scatterMetrics);

      assert.ok(scatterMetrics.centerScale >= 2, `${viewport.name}: opening title is not large`);
      assert.ok(scatterMetrics.asideX > viewport.width * 0.5, `${viewport.name}: story enters before the orbit exists`);
      assert.ok(
        scatterMetrics.visiblePortraits >= 8,
        `${viewport.name}: only ${scatterMetrics.visiblePortraits} scattered portraits remain in the opening viewport`,
      );
      assert.ok(
        scatterMetrics.portraitTranslations.filter((distance) => distance > 80).length >= 8,
        `${viewport.name}: opening portraits are already arranged as a ring`,
      );
      assert.ok(
        Math.max(...scatterMetrics.portraitTranslations) <= 440,
        `${viewport.name}: opening portraits spread ${Math.round(Math.max(...scatterMetrics.portraitTranslations))}px away from the future orbit`,
      );
      assert.ok(
        Math.max(...scatterMetrics.portraitScales) <= 1.5,
        `${viewport.name}: opening portraits are more than ten percent larger than requested`,
      );

      await page.screenshot({
        path: path.join(process.cwd(), "docs", "verification", "help-experience", "ring-1440-scatter.png"),
      });

      await page.evaluate(
        ({ top, travel }) => window.scrollTo(0, Math.round(top + travel * 0.5)),
        { top: sectionTop, travel: desktopTravel },
      );
      await page.waitForTimeout(250);
      orbitMetrics = await page.evaluate(() => {
        const matrixFor = (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform);
        const centerOf = (element) => {
          const box = element.getBoundingClientRect();
          return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        };
        const centerOfPath = () => {
          const orbit = document.querySelector(".ring-orbit");
          const portrait = document.querySelector(".ring-portrait");
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
          return {
            x: (Math.min(...points.map((point) => point.x)) + Math.max(...points.map((point) => point.x))) / 2,
            y: (Math.min(...points.map((point) => point.y)) + Math.max(...points.map((point) => point.y))) / 2,
          };
        };
        const portraits = [...document.querySelectorAll(".ring-portrait")].map(matrixFor);
        const center = matrixFor(document.querySelector(".ring-center"));
        const aside = matrixFor(document.querySelector(".ring-aside"));
        const orbitCenter = centerOfPath();
        const copyCenter = centerOf(document.querySelector(".ring-center__copy"));
        return {
          centerScale: Math.hypot(center.a, center.b),
          asideX: aside.e,
          centerDelta: {
            x: Math.abs(orbitCenter.x - copyCenter.x),
            y: Math.abs(orbitCenter.y - copyCenter.y),
          },
          portraitTranslations: portraits.map((matrix) => Math.hypot(matrix.e, matrix.f)),
          portraitScales: portraits.map((matrix) => Math.hypot(matrix.a, matrix.b)),
        };
      });

      assert.ok(orbitMetrics.centerScale <= 1.01, `${viewport.name}: title did not shrink inside the orbit`);
      assert.ok(orbitMetrics.asideX > viewport.width * 0.5, `${viewport.name}: story enters before the completed orbit`);
      assert.ok(
        orbitMetrics.portraitTranslations.every((distance) => distance < 1),
        `${viewport.name}: portraits did not finish gathering into the orbit`,
      );
      assert.ok(
        orbitMetrics.portraitScales.every((scale) => Math.abs(scale - 1) < 0.01),
        `${viewport.name}: portraits keep their scattered scale after gathering`,
      );
      assert.ok(
        orbitMetrics.centerDelta.x < 2 && orbitMetrics.centerDelta.y < 2,
        `${viewport.name}: text misses the orbit centre by ${orbitMetrics.centerDelta.x.toFixed(1)}px × ${orbitMetrics.centerDelta.y.toFixed(1)}px`,
      );

      await page.screenshot({
        path: path.join(process.cwd(), "docs", "verification", "help-experience", "ring-1440-orbit.png"),
      });

      await page.evaluate(
        ({ top, travel }) => window.scrollTo(0, Math.round(top + travel * 0.84)),
        { top: sectionTop, travel: desktopTravel },
      );
      await page.waitForFunction(() => {
        const scales = [...document.querySelectorAll(".ring-gather__item")].map((item) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
          return Math.hypot(matrix.a, matrix.b);
        });
        return scales.some((scale) => scale > 0.05) && scales.some((scale) => scale < 0.95);
      });
      midGatherScales = await page.locator(".ring-gather__item").evaluateAll((items) =>
        items.map((item) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
          return Math.hypot(matrix.a, matrix.b);
        }),
      );
      console.log(`${viewport.name} mid-gather scales`, midGatherScales);

      await page.evaluate(
        ({ top, travel }) => window.scrollTo(0, Math.round(top + travel * 0.97)),
        { top: sectionTop, travel: desktopTravel },
      );
      await page.waitForFunction(() => {
        const aside = document.querySelector(".ring-aside");
        if (!aside) return false;
        return Math.abs(new DOMMatrixReadOnly(getComputedStyle(aside).transform).e) < 1;
      });
      await page.waitForFunction(() => {
        const center = document.querySelector(".ring-center");
        const stage = document.querySelector(".ring-stage");
        if (!center || !stage) return false;
        const transform = getComputedStyle(center).transform;
        if (transform === "none") return false;
        const translateX = Number.parseFloat(transform.split(",")[4] || "0");
        return translateX <= center.offsetWidth * -0.3;
      });
      await page.waitForFunction(() => {
        const orbit = document.querySelector(".ring-orbit");
        if (!orbit) return false;
        return new DOMMatrixReadOnly(getComputedStyle(orbit).transform).a <= 0.681;
      });
      await page.waitForFunction(() => {
        const items = [...document.querySelectorAll(".ring-gather__item")];
        return items.length > 0 && items.every(
          (item) => {
            const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
            return Math.hypot(matrix.a, matrix.b) >= 0.99;
          },
        );
      });
    } else {
      await page.evaluate((top) => window.scrollTo(0, top), sectionTop);
      if (viewport.width <= 560 && !viewport.reducedMotion) {
        const before = await page.locator(".ring-portrait").first().evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).offsetDistance),
        );
        await page.waitForTimeout(800);
        const after = await page.locator(".ring-portrait").first().evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).offsetDistance),
        );
        compactOrbitMotion = Math.abs(after - before);
      }
    }

    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          left: box.left,
          width: box.width,
          height: box.height,
        };
      };

      const aside = document.querySelector(".ring-aside");
      const stage = document.querySelector(".ring-stage");
      const orbit = document.querySelector(".ring-orbit");
      const center = document.querySelector(".ring-center");
      const gatherItems = [...document.querySelectorAll(".ring-gather__item")];
      const portraits = [...document.querySelectorAll(".ring-portrait")].filter((element) => {
        const box = element.getBoundingClientRect();
        return box.right > 0 && box.left < innerWidth && box.bottom > 0 && box.top < innerHeight;
      });

      const pathCenter = (() => {
        if (!orbit) return null;
        const portrait = document.querySelector(".ring-portrait");
        if (!portrait) return null;
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
        return {
          x: (Math.min(...points.map((point) => point.x)) + Math.max(...points.map((point) => point.x))) / 2,
          y: (Math.min(...points.map((point) => point.y)) + Math.max(...points.map((point) => point.y))) / 2,
        };
      })();

      return {
        pageWidth: document.documentElement.scrollWidth,
        section: rect("#rescued"),
        stage: rect(".ring-stage"),
        orbit: rect(".ring-orbit"),
        visual: rect(".ring-visual"),
        centerCopy: rect(".ring-center__copy"),
        pathCenter,
        aside: rect(".ring-aside"),
        gatherItems: gatherItems.map((item) => rect(`.ring-gather__item:nth-child(${gatherItems.indexOf(item) + 1})`)),
        stageDisplay: stage ? getComputedStyle(stage).display : null,
        asidePosition: aside ? getComputedStyle(aside).position : null,
        asideClientHeight: aside?.clientHeight ?? 0,
        asideScrollHeight: aside?.scrollHeight ?? 0,
        asideOpacity: aside ? getComputedStyle(aside).opacity : null,
        asideLeadFontSize: Number.parseFloat(
          getComputedStyle(document.querySelector(".ring-aside__lead")).fontSize,
        ),
        asideNoteFontSize: Number.parseFloat(
          getComputedStyle(document.querySelector(".ring-aside__note")).fontSize,
        ),
        orbitScale: orbit ? getComputedStyle(orbit).transform : null,
        asideInlineStyle: aside?.getAttribute("style") ?? null,
        centerTransform: center ? getComputedStyle(center).transform : null,
        centerInlineStyle: center?.getAttribute("style") ?? null,
        visiblePortraits: portraits.length,
        portraitImages: [...document.querySelectorAll(".ring-portrait img")].slice(0, 3).map((image) => {
          const box = image.getBoundingClientRect();
          const style = getComputedStyle(image);
          return {
            naturalWidth: image.naturalWidth,
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            opacity: style.opacity,
            visibility: style.visibility,
          };
        }),
        counters: [...document.querySelectorAll(".ring-mark")].map((element) =>
          Number.parseInt(element.textContent || "0", 10),
        ),
      };
    });

    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(localAssetFailures, [], `${viewport.name}: local image failures`);
    assert.ok(
      metrics.pageWidth <= viewport.width,
      `${viewport.name}: horizontal overflow ${metrics.pageWidth}px > ${viewport.width}px`,
    );
    assert.ok(metrics.visual, `${viewport.name}: .ring-visual must own the visual canvas`);
    assert.ok(metrics.centerCopy, `${viewport.name}: .ring-center__copy must bound the central copy`);
    assert.ok(metrics.visiblePortraits >= 6, `${viewport.name}: only ${metrics.visiblePortraits} portraits visible`);
    assert.ok(
      metrics.counters.length >= 2 && metrics.counters.every((value) => value > 0),
      `${viewport.name}: hydrated counters must be non-zero`,
    );
    console.log(`${viewport.name} metrics`, metrics);

    if (viewport.width > 900 && !viewport.flow) {
      assert.ok(
        metrics.stage.width >= Math.min(1080, viewport.width - 120),
        `${viewport.name}: ring stage is still too small`,
      );
      assert.ok(metrics.aside.width >= 390, `${viewport.name}: story column is still too narrow`);
      assert.ok(metrics.asideLeadFontSize >= 30, `${viewport.name}: story lead is still too small`);
      assert.ok(metrics.asideNoteFontSize >= 16, `${viewport.name}: story body is still too small`);
      assert.ok(
        metrics.aside.left - metrics.orbit.right >= Math.min(48, viewport.width * 0.0375),
        `${viewport.name}: ring/story gap is only ${Math.round(metrics.aside.left - metrics.orbit.right)}px`,
      );
      assert.equal(metrics.asidePosition, "absolute", `${viewport.name}: aside must stay in the sticky scene`);
      assert.equal(
        overlaps(metrics.centerCopy, metrics.aside),
        false,
        `${viewport.name}: center copy overlaps the story column`,
      );
      assert.ok(
        metrics.asideScrollHeight <= metrics.asideClientHeight + 1,
        `${viewport.name}: story column clips ${metrics.asideScrollHeight - metrics.asideClientHeight}px`,
      );
      assert.ok(
        midGatherScales.some((scale) => scale > 0.05) &&
          midGatherScales.some((scale) => scale < 0.95),
        `${viewport.name}: wishlist objects no longer arrive progressively`,
      );
      const copyCenter = {
        x: metrics.centerCopy.left + metrics.centerCopy.width / 2,
        y: metrics.centerCopy.top + metrics.centerCopy.height / 2,
      };
      assert.ok(
        Math.abs(metrics.pathCenter.x - copyCenter.x) < 2 && Math.abs(metrics.pathCenter.y - copyCenter.y) < 2,
        `${viewport.name}: final text is not centred in the orbit`,
      );
      const itemCentersY = metrics.gatherItems.map((item) => item.top + item.height / 2);
      assert.equal(metrics.gatherItems.length, 4, `${viewport.name}: the two rejected objects returned`);
      assert.ok(
        Math.max(...itemCentersY) - Math.min(...itemCentersY) >= metrics.stage.height * 0.4,
        `${viewport.name}: wishlist objects still pile up at the bottom of the story column`,
      );
      assert.ok(
        metrics.gatherItems.filter((item) => item.right <= metrics.aside.left + 30 || item.left >= metrics.aside.right - 90).length >= 4,
        `${viewport.name}: wishlist objects are not decorating the story column edges`,
      );

      await page.screenshot({
        path: path.join(process.cwd(), "docs", "verification", "help-experience", "ring-1440-forward.png"),
      });

      await page.evaluate(
        ({ top, travel }) => window.scrollTo(0, Math.round(top + travel * 0.02)),
        { top: sectionTop, travel: desktopTravel },
      );
      await page.waitForFunction(() => {
        const orbit = document.querySelector(".ring-orbit");
        const center = document.querySelector(".ring-center");
        const aside = document.querySelector(".ring-aside");
        const items = [...document.querySelectorAll(".ring-gather__item")];
        if (!orbit || !center || !aside || items.length === 0) return false;
        const orbitMatrix = new DOMMatrixReadOnly(getComputedStyle(orbit).transform);
        const centerMatrix = new DOMMatrixReadOnly(getComputedStyle(center).transform);
        const asideMatrix = new DOMMatrixReadOnly(getComputedStyle(aside).transform);
        const portraits = [...document.querySelectorAll(".ring-portrait")].map(
          (portrait) => new DOMMatrixReadOnly(getComputedStyle(portrait).transform),
        );
        return orbitMatrix.a >= 0.99 &&
          Math.abs(orbitMatrix.e) < 1 &&
          Math.abs(centerMatrix.e) < 1 &&
          Math.hypot(centerMatrix.a, centerMatrix.b) >= 2 &&
          asideMatrix.e > innerWidth * 0.5 &&
          portraits.filter((matrix) => Math.hypot(matrix.e, matrix.f) > 80).length >= 8 &&
          items.every((item) => {
            const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
            return Math.hypot(matrix.a, matrix.b) <= 0.01;
          });
      });

      const reverseMetrics = await page.evaluate(() => ({
        orbit: getComputedStyle(document.querySelector(".ring-orbit")).transform,
        center: getComputedStyle(document.querySelector(".ring-center")).transform,
        aside: getComputedStyle(document.querySelector(".ring-aside")).transform,
        portraits: [...document.querySelectorAll(".ring-portrait")].map((portrait) =>
          getComputedStyle(portrait).transform
        ),
        gatherScales: [...document.querySelectorAll(".ring-gather__item")].map((item) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
          return Math.hypot(matrix.a, matrix.b);
        }),
      }));
      console.log(`${viewport.name} reverse metrics`, reverseMetrics);
      await page.screenshot({
        path: path.join(process.cwd(), "docs", "verification", "help-experience", "ring-1440-reverse.png"),
      });
    } else {
      assert.equal(metrics.stageDisplay, "flex", `${viewport.name}: stage must use document flow`);
      assert.equal(metrics.asidePosition, "static", `${viewport.name}: aside must participate in flow`);
      assert.ok(
        metrics.visiblePortraits >= 10,
        `${viewport.name}: desktop scatter leaked into the compact ring; only ${metrics.visiblePortraits} portraits remain visible`,
      );
      assert.equal(
        overlaps(metrics.centerCopy, metrics.aside),
        false,
        `${viewport.name}: visual and story copy overlap`,
      );
      assert.ok(
        metrics.asideScrollHeight <= metrics.asideClientHeight + 1,
        `${viewport.name}: story column clips ${metrics.asideScrollHeight - metrics.asideClientHeight}px`,
      );
      assert.ok(
        metrics.section.height >= metrics.stage.height,
        `${viewport.name}: section is shorter than its flow content`,
      );
      if (viewport.width <= 560 && !viewport.reducedMotion) {
        assert.ok(
          compactOrbitMotion >= 0.5,
          `${viewport.name}: compact orbit is static (${compactOrbitMotion?.toFixed(2) ?? "n/a"}% movement)`,
        );
      }
    }

    console.log(
      `${viewport.name}: ${viewport.width}x${viewport.height}, section=${Math.round(metrics.section.height)}, portraits=${metrics.visiblePortraits}`,
    );
    if (viewport.name === "desktop" || viewport.name === "mobile") {
      await page.screenshot({
        path: path.join(process.cwd(), "docs", "verification", "help-experience", `ring-${viewport.width}.png`),
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
