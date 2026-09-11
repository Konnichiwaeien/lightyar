import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/donate/serkan");
const moods = ["worried", "cautious", "relieved", "trusting"];
const bounds = [];

for (const mood of moods) {
  const file = path.join(root, `${mood}.webp`);
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, 1200, `${mood}: width`);
  assert.equal(metadata.height, 1500, `${mood}: height`);
  assert.equal(metadata.hasAlpha, true, `${mood}: alpha`);

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width;
  let y0 = info.height;
  let x1 = -1;
  let y1 = -1;
  let visible = 0;
  let partial = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 0 && alpha < 255) partial += 1;
      if (alpha <= 4) continue;
      visible += 1;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
      assert.ok(x >= 4 && x < info.width - 4 && y >= 4 && y < info.height - 4, `${mood}: content touches frame`);
    }
  }

  assert.ok(visible > info.width * info.height * 0.14, `${mood}: foreground too small`);
  assert.ok(partial > 100, `${mood}: no softened alpha edge`);
  bounds.push({ mood, x0, y0, x1, y1, baseline: y1 });
}

const baselines = bounds.map((item) => item.baseline);
assert.ok(Math.max(...baselines) - Math.min(...baselines) <= 8, `baseline variance: ${baselines.join(", ")}`);
console.log(JSON.stringify(bounds, null, 2));
