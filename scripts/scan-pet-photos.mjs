/**
 * Отбор снимков, годных для вырезки в полный рост.
 *
 * Работает по ТЕКСТУРЕ, а не по цвету. Причина та же, о которой предупреждает
 * кейер в «Дай Лапу»: по цвету светлая шерсть неотличима от снега и выедается
 * вместе с фоном. Снег и небо гладкие, шерсть — нет, поэтому карта градиента
 * разделяет их независимо от светлоты.
 *
 * Что считаем по каждому снимку:
 *   — насколько ровный фон по кромке кадра (разброс цвета);
 *   — рамку области с высокой текстурой: это и есть животное;
 *   — запас от этой рамки до края кадра — если ноль, животное срезано.
 *
 *   node scripts/scan-pet-photos.mjs <индекс.json> <кэш> <отчёт.json> [лимит]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , INDEX, CACHE, REPORT, LIMIT] = process.argv;
const limit = Number(LIMIT || 0);

fs.mkdirSync(CACHE, { recursive: true });

const pets = JSON.parse(fs.readFileSync(INDEX, "utf8")).data || [];
const shots = [];
for (const pet of pets) {
  for (const photo of pet.photos || []) {
    const f = photo.formats || {};
    const pick = f.medium || f.small || f.large;
    if (!pick?.url) continue;
    shots.push({ pet: pet.name, type: pet.type, status: pet.petStatus, url: pick.url, file: path.basename(pick.url) });
  }
}
const work = limit ? shots.slice(0, limit) : shots;
console.log(`снимков к разбору: ${work.length}`);

/** Скачиваем пачками: по одному — долго, все разом — рвётся соединение. */
async function fetchAll(list, concurrency = 8) {
  let index = 0;
  let got = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < list.length) {
      const item = list[index++];
      const dest = path.join(CACHE, item.file);
      if (fs.existsSync(dest)) { got += 1; continue; }
      try {
        const res = await fetch(item.url);
        if (!res.ok) continue;
        fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
        got += 1;
      } catch {}
    }
  });
  await Promise.all(workers);
  return got;
}

console.log("качаю…");
console.log(`скачано: ${await fetchAll(work)}`);

/** Порог текстуры: ниже — гладкая поверхность (снег, небо, стена). */
const TEXTURE = 30;

async function analyse(file) {
  const src = path.join(CACHE, file);
  if (!fs.existsSync(src)) return null;

  // работаем на маленькой копии: рамка объекта не требует полного разрешения
  const W = 200;
  const { data, info } = await sharp(src)
    .resize(W, W, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels: ch } = info;
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += ch, p += 1) {
    lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // градиент по Собелю — грубо, но для разделения «гладко / текстурно» хватает
  const grad = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      const gx = lum[i - 1] - lum[i + 1];
      const gy = lum[i - w] - lum[i + w];
      grad[i] = Math.hypot(gx, gy);
    }
  }

  /* Раньше здесь бралась общая рамка всех текстурных пикселей — и она
     ловила забор, горизонт и шум сжатия, поэтому «запас до края» почти
     везде выходил единицей. Теперь ищем СВЯЗНЫЕ области: животное — это
     одно крупное пятно, а фоновая мелочь рассыпана и отсекается. */

  // смыкаем шерсть в сплошное пятно, иначе одна собака распадается на сотни
  const R = 1;
  const solid = new Uint8Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (grad[y * w + x] < TEXTURE) continue;
      for (let dy = -R; dy <= R; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -R; dx <= R; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          solid[yy * w + xx] = 1;
        }
      }
    }
  }

  // разметка связных областей обходом в ширину
  const label = new Int32Array(w * h).fill(-1);
  const blobs = [];
  const queue = new Int32Array(w * h);
  for (let s = 0; s < w * h; s += 1) {
    if (!solid[s] || label[s] !== -1) continue;
    const id = blobs.length;
    let head = 0;
    let tail = 0;
    queue[tail++] = s;
    label[s] = id;
    let area = 0, bx0 = w, bx1 = -1, by0 = h, by1 = -1, sx = 0, sy = 0;
    while (head < tail) {
      const i = queue[head++];
      const x = i % w;
      const y = (i - x) / w;
      area += 1; sx += x; sy += y;
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
      if (y < by0) by0 = y;
      if (y > by1) by1 = y;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (solid[j] && label[j] === -1) { label[j] = id; queue[tail++] = j; }
      }
    }
    blobs.push({ area, bx0, bx1, by0, by1, cx: sx / area, cy: sy / area });
  }
  if (!blobs.length) return null;

  // животное — самое крупное пятно, чей центр лежит в средней части кадра
  const central = blobs.filter((b) => b.cx > w * 0.15 && b.cx < w * 0.85 && b.cy > h * 0.1 && b.cy < h * 0.92);
  const pool = central.length ? central : blobs;
  const subject = pool.reduce((a, b) => (b.area > a.area ? b : a));

  const minX = subject.bx0, maxX = subject.bx1, minY = subject.by0, maxY = subject.by1;
  const hot = subject.area;
  const blobShare = Math.round((subject.area / blobs.reduce((s, b) => s + b.area, 0)) * 100);

  // ровность фона: разброс яркости по кромке кадра
  const edge = [];
  for (let x = 0; x < w; x += 2) { edge.push(lum[x]); edge.push(lum[(h - 1) * w + x]); }
  for (let y = 0; y < h; y += 2) { edge.push(lum[y * w]); edge.push(lum[y * w + w - 1]); }
  const mean = edge.reduce((s, v) => s + v, 0) / edge.length;
  const sd = Math.sqrt(edge.reduce((s, v) => s + (v - mean) ** 2, 0) / edge.length);

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  return {
    file,
    w, h,
    pad: { l: minX, r: w - 1 - maxX, t: minY, b: h - 1 - maxY },
    box: { w: bw, h: bh, ratio: +(bw / bh).toFixed(2) },
    // доля кадра, занятая объектом
    cover: Math.round((hot / (w * h)) * 100),
    // какую долю всей текстуры кадра занимает найденное животное
    blobShare,
    bgFlat: Math.round(sd),
    bgLum: Math.round(mean),
  };
}

const out = [];
let done = 0;
for (const item of work) {
  const r = await analyse(item.file);
  done += 1;
  if (done % 100 === 0) console.log(`  разобрано ${done}/${work.length}`);
  if (r) out.push({ ...item, ...r });
}

fs.writeFileSync(REPORT, JSON.stringify(out, null, 1));
console.log(`готово, записей: ${out.length} → ${REPORT}`);
