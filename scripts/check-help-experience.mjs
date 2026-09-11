import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000";
const outputDir = path.join(process.cwd(), "docs", "verification", "help-experience");
const viewports = [
  { name: "narrow", width: 320, height: 700 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const pageErrors = [];
    const failedAssets = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.origin === baseUrl &&
        (url.pathname.startsWith("/donate/") || url.pathname.startsWith("/volunteer/")) &&
        response.status() >= 400
      ) {
        failedAssets.push(`${response.status()} ${url.pathname}`);
      }
    });

    await page.goto(baseUrl, { waitUntil: "load", timeout: 60_000 });
    const donation = page.locator("#donate");
    const volunteer = page.locator("#volunteer");
    await donation.waitFor({ state: "visible" });
    await donation.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#donate img")].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    const feed = donation.locator(".donation-feed");
    const providerButton = donation.locator(".donation-provider-button");
    const tierLabels = donation.locator(".donation-tier");
    const helpTab = donation.locator("#donation-tab-help");
    const feedTab = donation.locator("#donation-tab-feed");

    assert.equal(await tierLabels.count(), 5, `${viewport.name}: expected four preset tiers and custom amount`);
    assert.equal(await feed.isVisible(), false, `${viewport.name}: feed must be hidden while the help tab is active`);
    assert.equal(await providerButton.getAttribute("aria-disabled"), "true");

    await tierLabels.nth(3).evaluate((element) => element.click());
    await page.waitForFunction(() => document.querySelector(".donation-pet")?.getAttribute("data-mood") === "trusting");
    assert.match(await providerButton.textContent(), /3\s?000 ₽/);

    await feedTab.click();
    await page.waitForFunction(() => {
      const panel = document.querySelector("#donation-panel-feed");
      if (!panel || panel.getAttribute("data-active") !== "true") return false;
      const style = getComputedStyle(panel);
      return style.visibility === "visible" && Number.parseFloat(style.opacity) > 0.99;
    });
    await feed.waitFor({ state: "visible" });
    const feedState = await feed.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: box.width,
        height: box.height,
      };
    });
    console.log(`${viewport.name}: feed state`, feedState);
    assert.equal(await feed.isVisible(), true, `${viewport.name}: feed tab did not reveal the helpers`);
    assert.match(await feed.textContent(), /Помощники фонда/);
    assert.match(await feed.textContent(), /Люди, которые рядом/);
    await helpTab.click();
    await page.waitForFunction(() => {
      const panel = document.querySelector("#donation-panel-help");
      if (!panel || panel.getAttribute("data-active") !== "true") return false;
      const style = getComputedStyle(panel);
      return style.visibility === "visible" && Number.parseFloat(style.opacity) > 0.99;
    });
    await providerButton.waitFor({ state: "visible" });
    assert.equal(await providerButton.isVisible(), true, `${viewport.name}: help tab did not restore the form`);

    await volunteer.scrollIntoViewIfNeeded();
    const volunteerImage = volunteer.locator("img");
    await volunteerImage.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => {
        const image = document.querySelector("#volunteer img");
        return image?.complete && image.naturalWidth > 0;
      },
      undefined,
      { timeout: 60_000 },
    );

    assert.equal(await volunteer.locator(".volunteer-role").count(), 3);
    assert.equal(await volunteer.locator(".volunteer-action-panel").isVisible(), true);

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { top: box.top, left: box.left, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      return {
        scrollWidth: document.documentElement.scrollWidth,
        tabs: rect(".donation-tabs"),
        pet: rect(".donation-pet"),
        form: rect(".donation-experience__form"),
        volunteerScene: rect(".volunteer-scene"),
        volunteerPanel: rect(".volunteer-action-panel"),
      };
    });

    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(failedAssets, [], `${viewport.name}: failed local assets`);
    assert.ok(layout.scrollWidth <= viewport.width, `${viewport.name}: horizontal overflow ${layout.scrollWidth}px`);
    assert.ok(layout.pet.top < layout.form.top, `${viewport.name}: pet must rise above the form edge`);
    assert.ok(layout.pet.bottom > layout.form.top, `${viewport.name}: pet must straddle the form edge`);

    if (viewport.width <= 960) {
      assert.ok(
        layout.tabs.bottom <= layout.form.top,
        `${viewport.name}: donation tabs intrude into the form`,
      );
    }

    if (viewport.width < 768) {
      assert.ok(layout.volunteerScene.top < layout.volunteerPanel.top, `${viewport.name}: volunteer panel must follow the photo`);
    }

    if (viewport.width === 320 || viewport.width === 1440) {
      await donation.screenshot({ path: path.join(outputDir, `donation-${viewport.width}.png`) });
      await volunteer.screenshot({ path: path.join(outputDir, `volunteer-${viewport.width}.png`) });
    }

    console.log(`${viewport.name}: ${viewport.width}px, no overflow, Serkan and feed verified`);
    await context.close();
  }
} finally {
  await browser.close();
}
