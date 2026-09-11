import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] || "http://localhost:3000/?qa=news-full-height";
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });

  await page.locator(".wishlist").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const giftCard = page.locator(".wishlist-card").first();
  const giftTitle = (await giftCard.locator(".wishlist-card__title b").innerText()).trim();
  const giftAmount = (await giftCard.locator(".wishlist-price").innerText()).replace(/\D/g, "");
  await giftCard.getByRole("button", { name: "Оплатить пожертвованием" }).click();
  await page.waitForTimeout(1_500);

  const giftBadge = (await page.locator(".donation-intent").innerText()).replace(/\s+/g, " ").trim();
  assert.ok(giftBadge.includes(giftTitle));
  assert.equal(await page.locator("#donation-custom-amount").inputValue(), giftAmount);
  assert.equal(await page.locator('input[name="donation-cadence"][value="once"]').isChecked(), true);
  assert.ok(Math.abs((await page.locator("#donate").boundingBox()).y) < 40, "gift CTA should scroll to donation form");

  await page.locator(".wishlist").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await giftCard.getByRole("button", { name: "Подарить", exact: true }).click();
  await page.waitForTimeout(350);
  const giftBody = page.locator(".gift-body");
  const modalBefore = await giftBody.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    preventsLenis: element.hasAttribute("data-lenis-prevent"),
  }));
  assert.ok(modalBefore.scrollHeight > modalBefore.clientHeight);
  assert.equal(modalBefore.preventsLenis, true);
  await giftBody.hover();
  await page.mouse.wheel(0, 650);
  await page.waitForTimeout(350);
  const modalScrollTop = await giftBody.evaluate((element) => element.scrollTop);
  assert.ok(modalScrollTop > 0, "gift modal should consume the wheel event");
  await page.keyboard.press("Escape");

  await page.locator("#campaigns").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  // The collection is a sticky stack; the last card has the topmost z-index
  // once the section is gathered and is the reliable interactive surface.
  const campaign = page.locator("#campaigns li").last();
  const campaignTitle = (await campaign.locator("h3").innerText()).trim();
  const beforeCampaignUrl = page.url();
  await campaign.getByRole("button", { name: "Помочь" }).click();
  await page.waitForTimeout(1_500);
  const campaignBadge = (await page.locator(".donation-intent").innerText()).replace(/\s+/g, " ").trim();
  assert.ok(campaignBadge.includes(campaignTitle));
  assert.equal(await page.locator('input[name="donation-tier"][value="500"]').isChecked(), true);
  assert.equal(await page.locator('input[name="donation-cadence"][value="once"]').isChecked(), true);
  assert.equal(page.url(), beforeCampaignUrl, "campaign help CTA should stay on the homepage");
  assert.ok(Math.abs((await page.locator("#donate").boundingBox()).y) < 40, "campaign CTA should scroll to donation form");
  await page.close();

  const matrix = [];
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 640 },
    { width: 768, height: 520 },
    { width: 1440, height: 500 },
    { width: 1920, height: 1080 },
  ]) {
    const matrixPage = await browser.newPage({ viewport });
    await matrixPage.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
    const pageWidth = await matrixPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert.equal(pageWidth.scrollWidth, pageWidth.clientWidth, `horizontal overflow at ${viewport.width}px`);

    await matrixPage.getByRole("button", { name: "Открыть меню" }).first().click();
    await matrixPage.waitForTimeout(550);
    const menu = matrixPage.getByRole("dialog", { name: "Главное меню" });
    const menuBefore = await menu.evaluate((element) => ({
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      overflowY: getComputedStyle(element).overflowY,
      preventsLenis: element.hasAttribute("data-lenis-prevent"),
    }));
    assert.equal(menuBefore.overflowY, "auto");
    assert.equal(menuBefore.preventsLenis, true);
    await menu.hover();
    await matrixPage.mouse.wheel(0, 1_000);
    await matrixPage.waitForTimeout(250);
    const menuScrollTop = await menu.evaluate((element) => element.scrollTop);
    if (menuBefore.scrollHeight > menuBefore.clientHeight) {
      assert.ok(menuScrollTop > 0, `menu should scroll at ${viewport.width}x${viewport.height}`);
    }
    const newsBox = await menu.getByRole("link", { name: "Новости" }).boundingBox();
    assert.ok(newsBox && newsBox.y + newsBox.height <= viewport.height + 1, "last menu item should be reachable");
    matrix.push({ viewport, pageWidth, menuBefore, menuScrollTop });
    await matrixPage.close();
  }

  console.log(JSON.stringify({
    gift: { title: giftTitle, amount: giftAmount, badge: giftBadge, modalScrollTop },
    campaign: { title: campaignTitle, badge: campaignBadge },
    matrix,
  }, null, 2));
} finally {
  await browser.close();
}
