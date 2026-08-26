import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputPath = process.argv[2];

if (!inputPath) {
  throw new Error("Usage: node scripts/logo/export-professional-logo.mjs <generated-logo.png>");
}

const projectRoot = path.resolve(import.meta.dirname, "../..");
const outputRoot = path.join(
  projectRoot,
  "public",
  "brand",
  "lightyar",
  "logo-v2",
);

const { data, info } = await sharp(inputPath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const offset = (y * info.width + x) * info.channels;
    const isNearBlack =
      data[offset] < 40 && data[offset + 1] < 40 && data[offset + 2] < 40;

    if (isNearBlack) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
const radiusX = (maxX - minX) / 2 + 2;
const radiusY = (maxY - minY) / 2 + 2;

const alphaMask = Buffer.from(`
  <svg width="${info.width}" height="${info.height}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${centerX}" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" fill="#fff"/>
  </svg>
`);

await mkdir(outputRoot, { recursive: true });

const masterPath = path.join(
  outputRoot,
  "lightyar-logo-professional-transparent-master.png",
);

await sharp(inputPath)
  .ensureAlpha()
  .composite([{ input: alphaMask, blend: "dest-in" }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(masterPath);

for (const size of [1024, 300]) {
  await sharp(masterPath)
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(
      path.join(
        outputRoot,
        `lightyar-logo-professional-transparent-${size}.png`,
      ),
    );
}

console.log(
  JSON.stringify({
    outputRoot,
    detectedEllipse: { centerX, centerY, radiusX, radiusY },
    files: [
      "lightyar-logo-professional-transparent-master.png",
      "lightyar-logo-professional-transparent-1024.png",
      "lightyar-logo-professional-transparent-300.png",
    ],
  }),
);

