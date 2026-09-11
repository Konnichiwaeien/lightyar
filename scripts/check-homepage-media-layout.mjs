import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000";
const expectedAssets = [
  "/about/moment-1.jpg",
  "/about/moment-2.jpg",
  "/about/moment-3.jpg",
  "/donate/companion.jpg",
  "/volunteer/walk.jpg",
  "/texture/paper-grain.png",
];
const viewports = [
  { name: "320", width: 320, height: 700 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
  { name: "1920", width: 1920, height: 1080 },
  { name: "1440-reduced", width: 1440, height: 1000, reducedMotion: "reduce" },
];
const screenshotWidths = new Set([320, 1440]);
const screenshotDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../docs/verification/homepage-media",
);

const rectsOverlap = (a, b) =>
  Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
  Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);

const waitForImages = async (locator) => {
  const images = locator.locator("img");
  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => {
      if (element.complete && element.naturalWidth > 0) return undefined;
      return Promise.race([
        element.decode(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timed out decoding ${element.currentSrc}`)), 15_000),
        ),
      ]);
    });
  }
};

const captureSection = async (page, selector, name, width) => {
  const section = page.locator(selector);
  await waitForImages(section);
  await section.screenshot({
    path: path.join(screenshotDirectory, `${name}-${width}.png`),
    animations: "disabled",
  });
};

await mkdir(screenshotDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
let regularDesktopText = null;

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: viewport.reducedMotion || "no-preference",
    });
    const page = await context.newPage();
    const pageErrors = [];
    const failedAssets = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("response", (response) => {
      const responseUrl = new URL(response.url());
      const optimizedSource = responseUrl.searchParams.get("url");
      const assetPath = optimizedSource ? decodeURIComponent(optimizedSource) : responseUrl.pathname;
      if (!expectedAssets.includes(assetPath)) return;
      if (response.status() >= 400) failedAssets.push(`${response.status()} ${assetPath}`);
    });

    await page.goto(baseUrl, { waitUntil: "load", timeout: 60_000 });
    const assetStatuses = await Promise.all(
      expectedAssets.map(async (asset) => {
        const response = await context.request.get(new URL(asset, baseUrl).href);
        return { asset, status: response.status() };
      }),
    );
    await page.locator(".about-moments").waitFor({ state: "attached", timeout: 30_000 });
    await page.locator(".donation-companion").waitFor({ state: "attached", timeout: 30_000 });
    await page.locator(".volunteer-scene").waitFor({ state: "attached", timeout: 30_000 });

    for (const selector of [".about-moments", ".donation-companion", ".volunteer-scene"]) {
      const locator = page.locator(selector);
      await locator.scrollIntoViewIfNeeded();
      await waitForImages(locator);
    }
    await page.waitForTimeout(150);

    const metrics = await page.evaluate(() => {
      const toRect = (element) => {
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
      const aboutItems = [...document.querySelectorAll(".about-moment")];
      const aboutFigures = [...document.querySelectorAll(".about-moment figure")];
      const donationLayout = document.querySelector(".donation-card-layout");
      const donationMedia = document.querySelector(".donation-companion");
      const donationForm = donationLayout?.querySelector("form");
      const donationFeed = donationLayout?.querySelector("form + div");
      const volunteer = document.querySelector("#volunteer");
      const volunteerTitle = volunteer?.querySelector("h2");
      const volunteerLink = volunteer?.querySelector("a");
      const grain = document.querySelector(".film-grain");

      return {
        pageWidth: document.documentElement.scrollWidth,
        aboutDisplay: getComputedStyle(document.querySelector(".about-moments")).display,
        aboutItems: aboutItems.map(toRect),
        aboutFigures: aboutFigures.map(toRect),
        donationDisplay: getComputedStyle(donationLayout).display,
        donationColumns: getComputedStyle(donationLayout).gridTemplateColumns,
        donationMedia: toRect(donationMedia),
        donationForm: toRect(donationForm),
        donationFeed: donationFeed ? toRect(donationFeed) : null,
        donationFormClipped: donationForm.scrollWidth > donationForm.clientWidth + 1,
        donationFeedClipped: donationFeed
          ? donationFeed.scrollWidth > donationFeed.clientWidth + 1
          : false,
        volunteer: toRect(volunteer),
        volunteerTitle: toRect(volunteerTitle),
        volunteerLink: toRect(volunteerLink),
        grainImage: grain ? getComputedStyle(grain).backgroundImage : "",
        grainOpacity: grain ? getComputedStyle(grain).opacity : "",
        grainDisplay: grain ? getComputedStyle(grain).display : "",
        contentText: [
          document.querySelector("#about")?.textContent,
          document.querySelector("#donate")?.textContent,
          document.querySelector("#volunteer")?.textContent,
        ].join(" ").replace(/\s+/g, " ").trim(),
      };
    });

    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(failedAssets, [], `${viewport.name}: failed local assets`);
    console.log(`${viewport.name} media metrics`, {
      aboutFigures: metrics.aboutFigures,
      donationMedia: metrics.donationMedia,
      donationDisplay: metrics.donationDisplay,
      donationColumns: metrics.donationColumns,
    });
    for (const { asset, status } of assetStatuses) {
      assert.equal(status, 200, `${viewport.name}: ${asset} returned ${status}`);
    }
    assert.ok(
      metrics.pageWidth <= viewport.width,
      `${viewport.name}: horizontal overflow ${metrics.pageWidth}px > ${viewport.width}px`,
    );
    assert.equal(metrics.aboutFigures.length, 3, `${viewport.name}: About figure count`);
    for (const figure of metrics.aboutFigures) {
      assert.ok(
        Math.abs(figure.height / figure.width - 1.25) < 0.03,
        `${viewport.name}: About figure is not 4:5`,
      );
    }
    for (let index = 1; index < metrics.aboutItems.length; index += 1) {
      assert.equal(
        rectsOverlap(metrics.aboutItems[index - 1], metrics.aboutItems[index]),
        false,
        `${viewport.name}: About moments overlap`,
      );
    }

    if (viewport.width < 640) {
      assert.ok(
        Math.abs(metrics.donationMedia.width / metrics.donationMedia.height - 4 / 3) < 0.04,
        `${viewport.name}: donation scene is not 4:3`,
      );
      assert.ok(
        metrics.aboutItems[1].left > metrics.aboutItems[0].left,
        `${viewport.name}: About items do not alternate alignment`,
      );
    } else if (viewport.width < 1280) {
      assert.ok(
        Math.abs(metrics.donationMedia.width / metrics.donationMedia.height - 16 / 9) < 0.04,
        `${viewport.name}: donation scene is not 16:9`,
      );
    } else {
      assert.equal(metrics.donationDisplay, "grid", `${viewport.name}: donation card is not a grid`);
      assert.equal(
        rectsOverlap(metrics.donationMedia, metrics.donationForm),
        false,
        `${viewport.name}: donation image overlaps form`,
      );
      if (metrics.donationFeed) {
        assert.equal(
          rectsOverlap(metrics.donationForm, metrics.donationFeed),
          false,
          `${viewport.name}: donation form overlaps live feed`,
        );
      }
    }

    assert.equal(metrics.donationFormClipped, false, `${viewport.name}: donation form is clipped`);
    assert.equal(metrics.donationFeedClipped, false, `${viewport.name}: donation feed is clipped`);
    assert.ok(
      metrics.volunteerTitle.left >= metrics.volunteer.left &&
        metrics.volunteerTitle.right <= metrics.volunteer.right,
      `${viewport.name}: volunteer heading escapes the scene`,
    );
    assert.ok(
      metrics.volunteerLink.left >= metrics.volunteer.left &&
        metrics.volunteerLink.right <= metrics.volunteer.right,
      `${viewport.name}: volunteer CTA escapes the scene`,
    );
    assert.match(metrics.grainImage, /paper-grain\.png/);
    assert.equal(metrics.grainOpacity, "0.04");
    assert.equal(metrics.grainDisplay, viewport.reducedMotion ? "none" : "block");

    if (viewport.name === "1440") regularDesktopText = metrics.contentText;
    if (viewport.reducedMotion) {
      assert.equal(metrics.contentText, regularDesktopText, "reduced motion changes page content");
    }

    if (!viewport.reducedMotion && screenshotWidths.has(viewport.width)) {
      await captureSection(page, "#about", "about", viewport.width);
      await captureSection(page, "#donate", "donate", viewport.width);
      await captureSection(page, "#volunteer", "volunteer", viewport.width);
    }

    console.log(`${viewport.name}: homepage media geometry passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
