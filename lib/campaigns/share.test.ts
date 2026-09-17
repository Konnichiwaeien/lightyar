import assert from "node:assert/strict";
import test from "node:test";
import { campaignShareLinks } from "./share.ts";

test("sharing keeps the campaign slug and encodes Russian titles for both services", () => {
  const url = "https://lightyar.shdk.tech/campaigns/korm";
  const title = "Корм & лекарства — 100% помощи";
  const links = campaignShareLinks(url, title);
  const vk = new URL(links.vk);
  const telegram = new URL(links.telegram);
  assert.equal(vk.origin + vk.pathname, "https://vk.com/share.php");
  assert.equal(vk.searchParams.get("url"), url);
  assert.equal(vk.searchParams.get("title"), title);
  assert.equal(telegram.origin + telegram.pathname, "https://t.me/share/url");
  assert.equal(telegram.searchParams.get("url"), url);
  assert.equal(telegram.searchParams.get("text"), title);
});

test("copy and social links omit tracking parameters and form anchors", () => {
  const links = campaignShareLinks("https://lightyar.shdk.tech/campaigns/korm?utm_source=vk#fund-contribution", "Корм");
  assert.equal(links.url, "https://lightyar.shdk.tech/campaigns/korm");
  assert.equal(new URL(links.vk).searchParams.get("url"), links.url);
  assert.equal(new URL(links.telegram).searchParams.get("url"), links.url);
});
