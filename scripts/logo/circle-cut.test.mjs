import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const logoRoot = path.join(
  projectRoot,
  "public",
  "brand",
  "lightyar",
  "logo-v2",
);

async function alphaBounds(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    canvasWidth: info.width,
    canvasHeight: info.height,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

async function brightEdgePixelCount(filePath) {
  const bounds = await alphaBounds(filePath);
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const centerX = bounds.centerX;
  const centerY = bounds.centerY;
  const radius = Math.min(bounds.width, bounds.height) / 2;
  const edgeDepth = Math.max(1.5, info.width / 512);
  let count = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = (y * info.width + x) * 4;
      const alpha = data[pixel + 3];
      const distance = Math.hypot(x - centerX, y - centerY);
      const average = (data[pixel] + data[pixel + 1] + data[pixel + 2]) / 3;

      if (alpha > 0 && distance >= radius - edgeDepth && average > 80) {
        count += 1;
      }
    }
  }

  return count;
}

for (const size of [1024, 300]) {
  test(`circle-cut ${size}px is round and centered`, async () => {
    const bounds = await alphaBounds(
      path.join(logoRoot, `lightyar-logo-circle-cut-${size}.png`),
    );

    assert.ok(
      Math.abs(bounds.width - bounds.height) <= 1,
      `alpha shape is ${bounds.width}x${bounds.height}, not a circle`,
    );
    assert.ok(
      Math.abs(bounds.centerX - (bounds.canvasWidth - 1) / 2) <= 0.5,
      `alpha shape is horizontally off-center at ${bounds.centerX}`,
    );
    assert.ok(
      Math.abs(bounds.centerY - (bounds.canvasHeight - 1) / 2) <= 0.5,
      `alpha shape is vertically off-center at ${bounds.centerY}`,
    );
  });

  test(`circle-cut ${size}px has no bright alpha fringe`, async () => {
    const count = await brightEdgePixelCount(
      path.join(logoRoot, `lightyar-logo-circle-cut-${size}.png`),
    );

    assert.equal(count, 0, `${count} bright pixels remain on the alpha edge`);
  });
}
