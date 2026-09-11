/**
 * Очистка вырезки: оставить только само животное.
 *
 * Заливка от края снимает ровный фон, но всё, до чего она не дошла, остаётся:
 * будка за собакой, ветки, тёмные комья на снегу. На белой странице снег
 * невидим, а мусор виден и выдаёт машинную обрезку.
 *
 * Поэтому после заливки смотрим, из скольких отдельных кусков состоит
 * непрозрачная часть, и оставляем самый крупный. Всё остальное это фон,
 * который не дотянулся до кромки кадра.
 *
 * Слабые полупрозрачные пиксели по краю тоже уходят: между шерстью и снегом
 * кайма мягкая, а между снегом и снегом она даёт грязную вуаль.
 *
 *   node scripts/clean-cutout.mjs <папка-вырезок> <папка-результата> [порог]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , SRC, OUT, CUTOFF] = process.argv;
if (!SRC || !OUT) {
  throw new Error("Usage: node scripts/clean-cutout.mjs <src-dir> <out-dir> [alpha-cutoff]");
}

/** Ниже этой непрозрачности пиксель считается вуалью, а не шерстью. */
const ALPHA = Number(CUTOFF ?? 90);

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const { data, info } = await sharp(path.join(SRC, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Плотная часть силуэта: по ней ищем куски, кайму вернём потом.
  const solid = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p += 1) solid[p] = data[p * 4 + 3] >= ALPHA ? 1 : 0;

  // Разметка связных кусков обходом в ширину. Самый крупный это животное.
  const label = new Int32Array(w * h).fill(-1);
  const queue = new Int32Array(w * h);
  const sizes = [];
  for (let start = 0; start < w * h; start += 1) {
    if (solid[start] === 0 || label[start] !== -1) continue;
    const id = sizes.length;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    label[start] = id;
    let size = 0;
    while (head < tail) {
      const p = queue[head++];
      size += 1;
      const x = p % w;
      const y = (p - x) / w;
      if (x > 0 && solid[p - 1] && label[p - 1] === -1) { label[p - 1] = id; queue[tail++] = p - 1; }
      if (x < w - 1 && solid[p + 1] && label[p + 1] === -1) { label[p + 1] = id; queue[tail++] = p + 1; }
      if (y > 0 && solid[p - w] && label[p - w] === -1) { label[p - w] = id; queue[tail++] = p - w; }
      if (y < h - 1 && solid[p + w] && label[p + w] === -1) { label[p + w] = id; queue[tail++] = p + w; }
    }
    sizes.push(size);
  }

  if (sizes.length === 0) {
    console.log(`  ${file}: пусто`);
    continue;
  }
  const main = sizes.indexOf(Math.max(...sizes));

  // Гасим всё, что не принадлежит главному куску, и обрезаем холст по нему.
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let p = 0; p < w * h; p += 1) {
    if (label[p] === main) {
      const x = p % w;
      const y = (p - x) / w;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    } else {
      data[p * 4 + 3] = 0;
    }
  }

  const share = Math.round((sizes[main] / sizes.reduce((s, v) => s + v, 0)) * 100);
  const bw = x1 - x0 + 1;
  const bh = y1 - y0 + 1;
  const side = Math.round(Math.max(bw, bh) * 1.1);
  const left = Math.max(0, Math.round((x0 + x1) / 2 - side / 2));
  const top = Math.max(0, Math.round((y0 + y1) / 2 - side / 2));

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: Math.min(side, w - left), height: Math.min(side, h - top) })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, file));

  console.log(`  ${file.padEnd(20)} кусков ${String(sizes.length).padStart(4)} → главный ${String(share).padStart(3)}%  рамка ${bw}×${bh}`);
}
