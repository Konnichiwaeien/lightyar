/**
 * Сборка вырезки на холст обложки и приёмка по стандарту.
 *
 * На входе папка с масками из rembg, на выходе webp 1200 × 1533, где животное
 * вписано в холст и стоит на нижней кромке. Каждая вырезка прогоняется через
 * scripts/audit-cutout.mjs, и негодные в папку результата не попадают: пороги
 * и причины в docs/pet-cutout-standard.md.
 *
 * Маска rembg по краю мягкая, а на белой странице полупрозрачная кайма
 * читается как грязь, поэтому слабые пиксели гасятся, а тело на пару пикселей
 * подрезается внутрь.
 *
 *   node scripts/hero-cutout.mjs <папка-масок> <папка-результата> [--all]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { audit, verdict } from "./audit-cutout.mjs";

const [, , SRC, OUT, FLAG] = process.argv;
if (!SRC || !OUT) throw new Error("Usage: node scripts/hero-cutout.mjs <src-dir> <out-dir> [--all]");

/** Складывать и негодные тоже: удобно, когда смотришь, что именно не прошло. */
const keepAll = FLAG === "--all";

/** Холст обложки: пропорция считается в CSS от высоты героя. */
const CANVAS_W = 1200;
const CANVAS_H = 1533;
/** Ниже этой непрозрачности пиксель считается каймой, а не шерстью. */
const FAINT = 150;

fs.mkdirSync(OUT, { recursive: true });
const stage = path.join(OUT, "_черновик");
fs.mkdirSync(stage, { recursive: true });

const rows = [];
for (const file of fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f)).sort()) {
  const { data, info } = await sharp(path.join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Кайма долой: всё слабее порога прозрачно, остальное непрозрачно целиком.
  for (let p = 0; p < w * h; p += 1) data[p * 4 + 3] = data[p * 4 + 3] >= FAINT ? 255 : 0;

  // Срез считаем по исходнику, а не по холсту: только здесь видно, что лапа
  // или хвост ушли за край фотографии. На холсте животное касается кромки
  // просто потому, что вписано в неё целиком.
  const edge = (pick, n) => {
    let best = 0;
    let cur = 0;
    for (let i = 0; i < n; i += 1) {
      cur = pick(i) === 255 ? cur + 1 : 0;
      if (cur > best) best = cur;
    }
    return best;
  };
  const срезИсходника = Math.max(
    edge((x) => data[x * 4 + 3], w),
    edge((x) => data[((h - 1) * w + x) * 4 + 3], w),
    edge((y) => data[y * w * 4 + 3], h),
    edge((y) => data[(y * w + w - 1) * 4 + 3], h),
  );

  const solid = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    // Подрезаем на пиксель внутрь: на кромке маски остаётся цвет фона.
    .blur(0.6)
    .png()
    .toBuffer();

  const trimmed = await sharp(solid).trim({ threshold: 1 }).toBuffer();
  const m = await sharp(trimmed).metadata();
  if (!m.width || !m.height) continue;

  const scale = Math.min(CANVAS_W / m.width, CANVAS_H / m.height);
  const bw = Math.round(m.width * scale);
  const bh = Math.round(m.height * scale);
  const body = await sharp(trimmed).resize(bw, bh).png().toBuffer();

  const canvas = await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: body, left: Math.round((CANVAS_W - bw) / 2), top: CANVAS_H - bh }])
    .png()
    .toBuffer();

  const draft = path.join(stage, file);
  await sharp(canvas).png({ compressionLevel: 9 }).toFile(draft);

  const row = await audit(draft);
  const fails = verdict(row).filter((f) => !f.startsWith("срез"));
  // Порог в долях кадра: у снимка 2560 в ширину цепочка в 12 пикселей это шум
  // маски, а у снимка 900 это уже отрезанная лапа.
  if (срезИсходника > Math.max(12, Math.round(Math.min(w, h) * 0.02))) fails.unshift(`срез в исходнике ${срезИсходника}`);
  rows.push({ file, fails, row });

  if (fails.length === 0 || keepAll) {
    const name = file.replace(/\.png$/i, ".webp");
    await sharp(canvas).webp({ quality: 88, effort: 6 }).toFile(path.join(OUT, name));
  }
}

const good = rows.filter((r) => r.fails.length === 0);
for (const r of rows) {
  console.log(`${r.file.padEnd(28)} ${r.fails.length ? "✗ " + r.fails.join(", ") : "годится"}`);
}
console.log(`\nвсего ${rows.length}, прошли стандарт ${good.length}`);
if (good.length) console.log("годные:", good.map((r) => r.file).join(", "));
