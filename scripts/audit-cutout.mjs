/**
 * Годность вырезки для обложки: замер по семи признакам.
 *
 * Глазами вырезки отбирались долго и с промахами, поэтому признаки посчитаны.
 * Пороги сняты с Капрала: это та вырезка, которую владелец назвал единственной
 * годной, и она задаёт планку остальным.
 *
 * Что меряем:
 *   срез       самая длинная цепочка плотных пикселей вдоль кромки холста.
 *              Больше нуля значит, что животное выходило за край фотографии,
 *              и лапа или хвост срезаны навсегда.
 *   куски      сколько отдельных пятен в непрозрачной части. Всё, кроме
 *              одного, это фон: будка, ветки, комья снега.
 *   вуаль      доля полупрозрачных пикселей. Высокая — рваная кайма.
 *   рост       высота силуэта в пикселях исходника. Низкий рост значит,
 *              что животное потом растянут, и шерсть поплывёт.
 *   резкость   средний перепад яркости внутри силуэта. Мыло от растяжения
 *              видно именно здесь, а не в размере файла.
 *   плотность  какую долю своей рамки занимает силуэт. Прилипший кусок
 *              пейзажа раздувает рамку и остаётся дырявым, доля падает.
 *   плита      доля строк рамки, залитых от края до края: так видно обрывок
 *              фона, прилипший к животному и потому не отделимый счётом кусков.
 *   осанка     отношение высоты силуэта к ширине. Сидящая и стоящая к нам
 *              собака вытянута вверх, лежащая и боковая — вширь.
 *   симметрия  насколько левая половина силуэта совпадает с правой.
 *              Взгляд в кадр даёт симметрию, профиль — нет.
 *
 *   node scripts/audit-cutout.mjs <папка или файл> [ещё папки]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/** Плотнее этого пиксель считается телом, а не каймой. */
const SOLID = 40;

/**
 * Пороги годности. Сняты с Капрала и трёх его соседей по обложке: это те
 * вырезки, которые прошли приёмку у владельца. Ниже планки на обложку не идём.
 *
 * Осанка отсеивает боковые кадры: собака в профиль на всю ширину смотрится
 * иллюстрацией из учебника, а не портретом. Резкость ловит растянутый
 * исходник, на котором шерсть превращается в кашу.
 */
export const LIMITS = {
  срез: 12,
  куски: 1,
  вуаль: 3,
  рост: 1400,
  резкость: 6,
  плотность: 52,
  плита: 3,
  осанка: 1.2,
  симметрия: 55,
};

function collect(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => /\.(png|webp)$/i.test(f))
    .sort()
    .map((f) => path.join(target, f));
}

export async function audit(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const alpha = (p) => data[p * 4 + 3];

  // Срез: плотные пиксели прямо на кромке холста.
  const run = (pick, n) => {
    let best = 0;
    let cur = 0;
    for (let i = 0; i < n; i += 1) {
      cur = pick(i) >= SOLID ? cur + 1 : 0;
      if (cur > best) best = cur;
    }
    return best;
  };
  // Низ не в счёт: на нижней кромке животное стоит, это и есть земля.
  // Верх и бока значат, что ухо, хвост или лапа ушли за край фотографии.
  const срез = Math.max(
    run((x) => alpha(x), w),
    run((y) => alpha(y * w), h),
    run((y) => alpha(y * w + w - 1), h),
  );

  // Связные пятна: тело должно быть одно.
  const solid = new Uint8Array(w * h);
  let body = 0;
  let veil = 0;
  for (let p = 0; p < w * h; p += 1) {
    const a = alpha(p);
    if (a >= SOLID) {
      solid[p] = 1;
      body += 1;
    } else if (a > 8) veil += 1;
  }
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
  // Пятна мельче сотой доли тела это шум сжатия, а не посторонний предмет.
  const куски = sizes.filter((s) => s > body / 100).length;

  // Рамка тела и его осанка.
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let p = 0; p < w * h; p += 1) {
    if (!solid[p]) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const bw = Math.max(1, x1 - x0 + 1);
  const bh = Math.max(1, y1 - y0 + 1);

  // Плотность: какую долю своей рамки занимает силуэт. Собака, снятая в упор,
  // заполняет рамку плотно. Прилипший кусок пейзажа рамку раздувает, а сам
  // остаётся дырявым, и доля падает. Плита ловит только прямые куски, этот
  // признак ловит рваные.
  const плотность = Math.round((body / (bw * bh)) * 100);

  // Плита: обрывок фона, прилипший к животному, счётом кусков не ловится,
  // потому что он с ним связан. Зато он прямоугольный: у него есть строки,
  // залитые от края до края рамки. У собаки таких строк почти нет.
  let slabRows = 0;
  for (let y = y0; y <= y1; y += 1) {
    let filled = 0;
    for (let x = x0; x <= x1; x += 1) if (solid[y * w + x]) filled += 1;
    if (filled >= bw * 0.92) slabRows += 1;
  }

  // Симметрия: сколько строк силуэта совпадает при отражении вокруг своей оси.
  let same = 0;
  let total = 0;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const mirror = x1 - (x - x0);
      total += 1;
      if (solid[y * w + x] === solid[y * w + mirror]) same += 1;
    }
  }

  // Резкость: средний перепад яркости внутри тела. Растянутый снимок гладкий.
  let edges = 0;
  let counted = 0;
  for (let y = y0 + 1; y < y1; y += 1) {
    for (let x = x0 + 1; x < x1; x += 1) {
      const p = y * w + x;
      if (!solid[p] || !solid[p - 1] || !solid[p - w]) continue;
      const lum = (q) => 0.299 * data[q * 4] + 0.587 * data[q * 4 + 1] + 0.114 * data[q * 4 + 2];
      edges += Math.abs(lum(p) - lum(p - 1)) + Math.abs(lum(p) - lum(p - w));
      counted += 1;
    }
  }

  return {
    файл: path.basename(file),
    срез,
    куски,
    вуаль: Math.round((veil / Math.max(1, body)) * 100),
    рост: bh,
    резкость: Math.round((counted ? edges / counted : 0) * 10) / 10,
    плотность,
    плита: Math.round((slabRows / bh) * 100),
    осанка: Math.round((bh / bw) * 100) / 100,
    симметрия: Math.round((same / Math.max(1, total)) * 100),
  };
}

export function verdict(row) {
  const fails = [];
  if (row.срез > LIMITS.срез) fails.push(`срез ${row.срез}`);
  if (row.куски > LIMITS.куски) fails.push(`куски ${row.куски}`);
  if (row.вуаль > LIMITS.вуаль) fails.push(`вуаль ${row.вуаль}%`);
  if (row.рост < LIMITS.рост) fails.push(`рост ${row.рост}`);
  if (row.резкость < LIMITS.резкость) fails.push(`резкость ${row.резкость}`);
  if (row.плотность < LIMITS.плотность) fails.push(`плотность ${row.плотность}%`);
  if (row.плита > LIMITS.плита) fails.push(`плита ${row.плита}%`);
  if (row.осанка < LIMITS.осанка) fails.push(`осанка ${row.осанка}`);
  if (row.симметрия < LIMITS.симметрия) fails.push(`симметрия ${row.симметрия}%`);
  return fails;
}

/** Запущен из командной строки, а не подключён как модуль. */
const entry = process.argv[1] ? new URL(`file:///${process.argv[1].replace(/\\/g, "/")}`).href : "";

if (import.meta.url === entry) {
  const targets = process.argv.slice(2);
  if (targets.length === 0) throw new Error("Usage: node scripts/audit-cutout.mjs <dir|file> …");

  let bad = 0;
  console.log("файл                  срез куски вуаль  рост резк плотн плита осанка симм  вердикт");
  for (const target of targets) {
    for (const file of collect(target)) {
      const row = await audit(file);
      const fails = verdict(row);
      if (fails.length) bad += 1;
      console.log(
        [
          row.файл.padEnd(21),
          String(row.срез).padStart(4),
          String(row.куски).padStart(5),
          String(row.вуаль).padStart(5),
          String(row.рост).padStart(5),
          String(row.резкость).padStart(4),
          String(row.плотность).padStart(6),
          String(row.плита).padStart(5),
          String(row.осанка).padStart(6),
          String(row.симметрия).padStart(4),
          fails.length ? " ✗ " + fails.join(", ") : " годится",
        ].join(" "),
      );
    }
  }
  if (bad > 0) process.exitCode = 1;
}
