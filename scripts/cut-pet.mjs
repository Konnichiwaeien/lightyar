/**
 * Вырезка животного из кадра со снегом.
 *
 * Метод взят из кейера «Дай Лапу» и переложен с зелёного экрана на снег.
 * Там ключ считался по ДОМИНИРОВАНИЮ зелёного канала, а не по расстоянию
 * в RGB, потому что серая шерсть по расстоянию неотличима от фона. Здесь
 * та же беда: белая собака на снегу по цвету равна снегу.
 *
 * Поэтому фон берётся не по цвету, а ЗАЛИВКОЙ ОТ КРАЯ: пиксель считается
 * фоном, только если до него можно дойти от кромки кадра, ни разу не
 * перешагнув заметный перепад. Светлая собака в середине кадра остаётся,
 * даже если её тон совпадает со снегом, — потому что вокруг неё есть контур.
 *
 * Мягкая кайма между двумя порогами — оттуда же: жёсткая граница делает
 * из животного наклейку.
 *
 *   node scripts/cut-pet.mjs <chosen.json> <папка-результата> [индексы через запятую]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , LIST, OUT, ONLY] = process.argv;
const only = ONLY ? new Set(ONLY.split(",").map(Number)) : null;

/** Рабочий размер: больше не нужно, портрет в кольце меньше 200px. */
const WORK = 1200;
/** Перепад, ниже которого заливка продолжает считать пиксель фоном. */
const KEEP = Number(process.env.CUT_KEEP ?? 16);
/** Перепад, выше которого точно объект. Между KEEP и DROP — полупрозрачность. */
const DROP = Number(process.env.CUT_DROP ?? 34);
/** Итоговый холст */
const CANVAS = 1200;

fs.mkdirSync(OUT, { recursive: true });
const rows = JSON.parse(fs.readFileSync(LIST, "utf8"));

for (const row of rows) {
  if (only && !only.has(row.i)) continue;

  const res = await fetch(row.original);
  if (!res.ok) { console.log(`  ${row.i} ${row.pet}: не скачался`); continue; }
  const raw = Buffer.from(await res.arrayBuffer());

  const img = sharp(raw).resize(WORK, WORK, { fit: "inside" });
  const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += ch, p += 1) {
    lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // перепад в точке: насколько она отличается от соседей
  const step = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      step[i] = Math.hypot(lum[i - 1] - lum[i + 1], lum[i - w] - lum[i + w]);
    }
  }

  /* Модель фона по кромке кадра: средний цвет и разброс. Заливка пойдёт
     только по пикселям, похожим на этот цвет. Одного перепада мало —
     внутри животного шерсть тоже гладкая, и заливка протекала насквозь. */
  let br = 0, bgr = 0, bb = 0, n = 0;
  const sample = (p) => { const s = p * ch; br += data[s]; bgr += data[s + 1]; bb += data[s + 2]; n += 1; };
  for (let x = 0; x < w; x += 1) { sample(x); sample((h - 1) * w + x); }
  for (let y = 0; y < h; y += 1) { sample(y * w); sample(y * w + w - 1); }
  br /= n; bgr /= n; bb /= n;

  let varSum = 0;
  const dist = (p) => {
    const s = p * ch;
    return Math.hypot(data[s] - br, data[s + 1] - bgr, data[s + 2] - bb);
  };
  for (let x = 0; x < w; x += 1) { varSum += dist(x) ** 2; varSum += dist((h - 1) * w + x) ** 2; }
  for (let y = 0; y < h; y += 1) { varSum += dist(y * w) ** 2; varSum += dist(y * w + w - 1) ** 2; }
  const spread = Math.sqrt(varSum / n);
  /* Допуск от разброса самого фона: на ровном снегу он узкий, на пёстром
     дворе широкий. Жёсткое число здесь работало бы только на одном кадре. */
  const TOL = Math.max(28, Math.min(90, spread * 2.2));

  /* Заливка от кромки: пиксель уходит в фон, только если он и похож на фон
     по цвету, и не стоит на перепаде. Перепад держит границу там, где
     светлая собака совпала со снегом по тону. */
  const bg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (bg[i]) return;
    if (step[i] >= DROP) return;
    if (dist(i) > TOL) return;
    bg[i] = 1;
    queue[tail++] = i;
  };
  for (let x = 0; x < w; x += 1) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y += 1) { push(y * w); push(y * w + w - 1); }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  /* Дырки внутри животного: пиксели, похожие на снег, но окружённые телом.
     Закрываем их отдельной заливкой от края по «не-фону» — всё, до чего
     она не дошла, объявляем объектом. */
  const outside = new Uint8Array(w * h);
  head = 0; tail = 0;
  const push2 = (i) => { if (!outside[i] && bg[i]) { outside[i] = 1; queue[tail++] = i; } };
  for (let x = 0; x < w; x += 1) { push2(x); push2((h - 1) * w + x); }
  for (let y = 0; y < h; y += 1) { push2(y * w); push2(y * w + w - 1); }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push2(i - 1);
    if (x < w - 1) push2(i + 1);
    if (y > 0) push2(i - w);
    if (y < h - 1) push2(i + w);
  }
  for (let i = 0; i < w * h; i += 1) if (bg[i] && !outside[i]) bg[i] = 0;

  // альфа: фон прозрачный, объект плотный, между KEEP и DROP — кайма
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0, p = 0; p < w * h; p += 1, i += 4) {
    const s = p * ch;
    out[i] = data[s];
    out[i + 1] = data[s + 1];
    out[i + 2] = data[s + 2];
    if (!bg[p]) {
      // у самой границы даём полупрозрачность по близости к фону:
      // резкая кромка превращает животное в наклейку
      const d = dist(p);
      out[i + 3] = d >= TOL ? 255 : Math.round(255 * Math.max(0, (d - TOL * 0.55) / (TOL * 0.45)));
    } else {
      out[i + 3] = 0;
    }
  }

  // рамка объекта
  let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let p = 0; p < w * h; p += 1) {
    if (out[p * 4 + 3] < 128) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) { console.log(`  ${row.i} ${row.pet}: объект не найден`); continue; }

  const bw = x1 - x0 + 1;
  const bh = y1 - y0 + 1;
  const side = Math.round(Math.max(bw, bh) * 1.12);
  const cx = Math.round((x0 + x1) / 2);
  const cy = Math.round((y0 + y1) / 2);

  const cropped = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({
      left: Math.max(0, Math.min(w - 1, cx - Math.round(side / 2))),
      top: Math.max(0, Math.min(h - 1, cy - Math.round(side / 2))),
      width: Math.min(side, w - Math.max(0, cx - Math.round(side / 2))),
      height: Math.min(side, h - Math.max(0, cy - Math.round(side / 2))),
    })
    .png()
    .toBuffer();

  const file = path.join(OUT, `${String(row.i).padStart(3, "0")}-${row.pet.replace(/[^\wА-Яа-яЁё]+/g, "_")}.png`);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(cropped).resize(CANVAS, CANVAS, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer() }])
    .png({ compressionLevel: 9 })
    .toFile(file);

  console.log(`  ${String(row.i).padStart(3)} ${row.pet.padEnd(12)} рамка ${bw}×${bh} → ${path.basename(file)}`);
}
