/**
 * Пережимает вырезки в WebP с альфой.
 *
 * Кодировщик — системный Chrome через canvas: отдельная библиотека для
 * одной операции не нужна, а playwright-core в проекте уже есть.
 *
 *   node scripts/webp-cutouts.mjs <папка> [размер] [качество]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const DIR = process.argv[2];
const SIZE = Number(process.argv[3] || 560);
const Q = Number(process.argv[4] || 0.86);

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".png"));
if (!files.length) { console.log("нет PNG в", DIR); process.exit(1); }

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
await page.goto("about:blank");

let before = 0;
let after = 0;

for (const file of files) {
  const src = path.join(DIR, file);
  const buf = fs.readFileSync(src);
  before += buf.length;

  const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  const out = await page.evaluate(
    async ([url, size, quality]) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL("image/webp", quality);
    },
    [dataUrl, SIZE, Q],
  );

  const bytes = Buffer.from(out.split(",")[1], "base64");
  const dest = src.replace(/\.png$/, ".webp");
  fs.writeFileSync(dest, bytes);
  after += bytes.length;
  console.log(
    `${file.padEnd(24)} ${String(Math.round(buf.length / 1024)).padStart(5)} КБ → ${String(Math.round(bytes.length / 1024)).padStart(4)} КБ`,
  );
}

console.log(`\nбыло ${(before / 1024 / 1024).toFixed(1)} МБ → стало ${(after / 1024 / 1024).toFixed(2)} МБ`);
await browser.close();
