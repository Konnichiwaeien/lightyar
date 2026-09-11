import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sliderSource = fs.readFileSync(
  new URL("./news-slider.tsx", import.meta.url),
  "utf8",
);
const detailSource = fs.readFileSync(
  new URL("../../app/news/[slug]/page.tsx", import.meta.url),
  "utf8",
);

test("news slider renders native video without autoplaying playable media", () => {
  assert.match(sliderSource, /<video/);
  assert.match(sliderSource, /controls/);
  assert.match(sliderSource, /playsInline/);
  assert.match(sliderSource, /preload="none"/);
  assert.match(sliderSource, /hasVideo/);
  assert.match(sliderSource, /useReducedMotion/);
});

test("news detail builds typed slides and renders separate attachments", () => {
  assert.match(detailSource, /buildNewsSlides/);
  assert.match(detailSource, /NewsAttachments/);
  assert.doesNotMatch(detailSource, /const imageUrls: string\[\]/);
});
