/**
 * Проверка вырезок: силуэт не должен доходить до края холста.
 *
 * Прямой срез на границе кадра — главный признак того, что взяли негодный
 * исходник: животное выходило за край фотографии, и никакой инструмент
 * не восстановит то, чего в снимке нет. Здесь это ловится по альфа-каналу.
 *
 *   node scripts/check-cutouts.mjs <папка>
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const DIR = process.argv[2];
/** Непрозрачным считаем пиксель плотнее этого: полупрозрачная шерсть не в счёт */
const SOLID = 40;
/** Сколько подряд непрозрачных пикселей на кромке уже читается как срез */
const RUN = 12;

const files = fs.readdirSync(DIR).filter((f) => /\.(png|webp)$/.test(f)).sort();
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
await page.goto("about:blank");

const rows = [];
for (const file of files) {
  const buf = fs.readFileSync(path.join(DIR, file));
  const mime = file.endsWith(".webp") ? "image/webp" : "image/png";
  const url = `data:${mime};base64,${buf.toString("base64")}`;

  const r = await page.evaluate(
    async ([src, solid, run]) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
      const at = (x, y) => data[(y * width + x) * 4 + 3];

      /** Самая длинная цепочка плотных пикселей вдоль кромки */
      const longest = (pick, n) => {
        let best = 0;
        let cur = 0;
        for (let i = 0; i < n; i += 1) {
          cur = pick(i) >= solid ? cur + 1 : 0;
          if (cur > best) best = cur;
        }
        return best;
      };

      const edges = {
        top: longest((x) => at(x, 0), width),
        bottom: longest((x) => at(x, height - 1), width),
        left: longest((y) => at(0, y), height),
        right: longest((y) => at(width - 1, y), height),
      };

      // доля непрозрачного и границы силуэта — чтобы видеть запас по краям
      let minX = width, maxX = 0, minY = height, maxY = 0, solidCount = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (at(x, y) >= solid) {
            solidCount += 1;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      /* Прямой срез внутри силуэта. Ищем длинные участки, где крайний
         непрозрачный пиксель стоит на одной и той же координате: живой
         контур так себя не ведёт, а рамка исходного снимка — именно так. */
      const straight = (limitOf, n) => {
        let best = 0, cur = 0, prev = null;
        for (let i = 0; i < n; i += 1) {
          const v = limitOf(i);
          if (v === null) { cur = 0; prev = null; continue; }
          // ровно одинаковая координата, без допуска: живой контур почти
          // вертикален на длинных участках и с допуском в 1px давал ложную тревогу
          cur = prev !== null && v === prev ? cur + 1 : 1;
          prev = v;
          if (cur > best) best = cur;
        }
        return best;
      };
      const rowMax = (y) => { for (let x = width - 1; x >= 0; x -= 1) if (at(x, y) >= solid) return x; return null; };
      const rowMin = (y) => { for (let x = 0; x < width; x += 1) if (at(x, y) >= solid) return x; return null; };
      const colMax = (x) => { for (let y = height - 1; y >= 0; y -= 1) if (at(x, y) >= solid) return y; return null; };
      const colMin = (x) => { for (let y = 0; y < height; y += 1) if (at(x, y) >= solid) return y; return null; };

      const flat = {
        right: straight(rowMax, height),
        left: straight(rowMin, height),
        bottom: straight(colMax, width),
        top: straight(colMin, width),
      };

      /* Остаточный фон: полупрозрачная дымка там, где должна быть пустота.
         Считаем её в рамке по краю кадра — внутри силуэта полупрозрачность
         законна (шерсть), а по углам её быть не должно. */
      const band = Math.round(Math.min(width, height) * 0.06);
      let hazeCount = 0, bandCount = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const edge = x < band || y < band || x >= width - band || y >= height - band;
          if (!edge) continue;
          bandCount += 1;
          const a = at(x, y);
          if (a >= 3 && a < solid) hazeCount += 1;
        }
      }

      return {
        width, height, edges, flat,
        haze: Math.round((hazeCount / bandCount) * 100),
        fill: Math.round((solidCount / (width * height)) * 100),
        pad: { l: minX, r: width - 1 - maxX, t: minY, b: height - 1 - maxY },
        cut: Object.entries(edges).filter(([, v]) => v >= run).map(([k]) => k),
        /* Прямая длиной от 12% стороны читается глазом как обрубленный край.
           Низ из проверки исключён намеренно: срез по груди — законная
           часть портрета, а не брак. */
        flatCut: Object.entries(flat)
          .filter(([k, v]) => k !== "bottom" && v >= Math.round(height * 0.12))
          .map(([k]) => k),
      };
    },
    [url, SOLID, RUN],
  );

  rows.push({ file, ...r });
}
await browser.close();

const RU = { top: "верх", bottom: "низ", left: "лево", right: "право" };
let bad = 0;
console.log("файл                       размер     заполнение  запас л/п/в/н        срез");
for (const r of rows) {
  const ok = r.cut.length === 0 && r.flatCut.length === 0;
  if (!ok) bad += 1;
  console.log(
    `${r.file.padEnd(26)} ${String(r.width)}×${String(r.height).padEnd(5)} ${String(r.fill + "%").padStart(6)}     ` +
      `${String(r.pad.l).padStart(3)}/${String(r.pad.r).padStart(3)}/${String(r.pad.t).padStart(3)}/${String(r.pad.b).padStart(3)}` +
      `   ${ok ? "нет" : [...r.cut, ...r.flatCut].map((c) => RU[c]).join(", ")}` +
      `  (бок/верх ${Math.max(r.flat.left, r.flat.right, r.flat.top)}px, низ ${r.flat.bottom}px, дымка ${r.haze}%)`,
  );
}
console.log(`\nсрез по краю: ${bad} из ${rows.length}`);
