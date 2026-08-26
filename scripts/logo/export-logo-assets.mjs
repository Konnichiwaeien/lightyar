import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { logoContract, pngFilename, svgFilename } from "./logo-contract.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const logoRoot = path.join(projectRoot, "public", "brand", "lightyar", "logo");
const svgRoot = path.join(logoRoot, "svg");
const pngRoot = path.join(logoRoot, "png");
const verificationRoot = path.join(projectRoot, "docs", "verification");

await mkdir(pngRoot, { recursive: true });

let exportCount = 0;

for (const exportGroup of logoContract.pngExports) {
  const source = await readFile(
    path.join(svgRoot, svgFilename(exportGroup.lockup, exportGroup.mode)),
  );

  for (const size of exportGroup.sizes) {
    const outputPath = path.join(
      pngRoot,
      pngFilename(exportGroup.lockup, exportGroup.mode, size),
    );

    await sharp(source, { density: 384 })
      .resize({ width: size, withoutEnlargement: false })
      .ensureAlpha()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(outputPath);

    exportCount += 1;
  }
}

console.log(`Exported ${exportCount} transparent PNG logo assets in ${pngRoot}`);

await mkdir(verificationRoot, { recursive: true });

const contactSheetFrame = Buffer.from(`
  <svg width="1600" height="1200" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1200" fill="#EDE8DE"/>
    <text x="54" y="64" fill="#1C1C1B" font-family="Arial" font-size="34" font-weight="700">Светлый · проверка адаптивного логотипа</text>
    <rect x="40" y="95" width="650" height="650" rx="30" fill="#FFFFFF"/>
    <rect x="720" y="95" width="400" height="430" rx="30" fill="#FFFFFF"/>
    <rect x="1140" y="95" width="400" height="430" rx="30" fill="#1C1C1B"/>
    <rect x="720" y="560" width="820" height="185" rx="30" fill="#FFFFFF"/>
    <rect x="40" y="780" width="1500" height="370" rx="30" fill="#FFFFFF"/>
    <text x="65" y="725" fill="#615C54" font-family="Arial" font-size="22">Основная эмблема · 600 px</text>
    <text x="745" y="505" fill="#615C54" font-family="Arial" font-size="22">Знак без надписи</text>
    <text x="1165" y="505" fill="#F7F3EB" font-family="Arial" font-size="22">Инверсная версия</text>
    <text x="745" y="600" fill="#1C1C1B" font-family="Arial" font-size="22" font-weight="700">Микрознак: 180 / 64 / 32 / 16 px</text>
    <text x="65" y="825" fill="#1C1C1B" font-family="Arial" font-size="22" font-weight="700">Горизонтальная версия</text>
    <text x="958" y="711" fill="#615C54" font-family="Arial" font-size="17">16</text>
    <text x="906" y="711" fill="#615C54" font-family="Arial" font-size="17">32</text>
    <text x="835" y="711" fill="#615C54" font-family="Arial" font-size="17">64</text>
  </svg>
`);

const primary600 = await sharp(path.join(pngRoot, pngFilename("primary", "color", 1024)))
  .resize(600, 600)
  .png()
  .toBuffer();
const symbol330 = await sharp(path.join(pngRoot, pngFilename("symbol", "color", 512)))
  .resize(330, 330)
  .png()
  .toBuffer();
const inverse330 = await sharp(path.join(pngRoot, pngFilename("primary", "inverse", 512)))
  .resize(330, 330)
  .png()
  .toBuffer();
const horizontal800 = await sharp(path.join(pngRoot, pngFilename("horizontal", "color", 1024)))
  .resize({ width: 800 })
  .png()
  .toBuffer();

const contactSheetPath = path.join(verificationRoot, "lightyar-logo-contact-sheet.png");

await sharp({
  create: {
    width: 1600,
    height: 1200,
    channels: 4,
    background: "#EDE8DE",
  },
})
  .composite([
    { input: contactSheetFrame, left: 0, top: 0 },
    { input: primary600, left: 65, top: 120 },
    { input: symbol330, left: 755, top: 135 },
    { input: inverse330, left: 1175, top: 135 },
    { input: path.join(pngRoot, pngFilename("micro", "color", 64)), left: 820, top: 625 },
    { input: path.join(pngRoot, pngFilename("micro", "color", 32)), left: 900, top: 657 },
    { input: path.join(pngRoot, pngFilename("micro", "color", 16)), left: 960, top: 673 },
    { input: path.join(pngRoot, pngFilename("micro", "color", 180)), left: 1300, top: 565 },
    { input: horizontal800, left: 400, top: 830 },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(contactSheetPath);

console.log(`Generated contact sheet at ${contactSheetPath}`);
