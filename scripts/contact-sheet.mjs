/**
 * Контактный лист: сетка миниатюр с номерами, чтобы отобрать кадры глазами.
 *
 *   node scripts/contact-sheet.mjs <кандидаты.json> <кэш> <папка-листов> [колонок] [на-лист]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , LIST, CACHE, OUT, COLS = 8, PER = 48] = process.argv;
const cols = Number(COLS);
const per = Number(PER);
const cell = 190;

const rows = JSON.parse(fs.readFileSync(LIST, "utf8"));
fs.mkdirSync(OUT, { recursive: true });

const sheets = Math.ceil(rows.length / per);
console.log(`кадров ${rows.length}, листов ${sheets}`);

for (let s = 0; s < sheets; s += 1) {
  const chunk = rows.slice(s * per, (s + 1) * per);
  const gridRows = Math.ceil(chunk.length / cols);
  const W = cols * cell;
  const H = gridRows * cell;

  const layers = [];
  for (let i = 0; i < chunk.length; i += 1) {
    const item = chunk[i];
    const src = path.join(CACHE, item.file);
    if (!fs.existsSync(src)) continue;
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    const buf = await sharp(src).resize(cell - 4, cell - 22, { fit: "contain", background: "#ffffff" }).toBuffer();
    layers.push({ input: buf, left: x + 2, top: y + 2 });

    const n = s * per + i;
    const label = `${n} ${item.pet}`.slice(0, 22);
    layers.push({
      input: Buffer.from(
        `<svg width="${cell}" height="20"><rect width="100%" height="100%" fill="#111"/>` +
          `<text x="4" y="14" font-family="monospace" font-size="12" fill="#fff">${label.replace(/[<&]/g, "")}</text></svg>`,
      ),
      left: x,
      top: y + cell - 20,
    });
  }

  const file = path.join(OUT, `sheet-${String(s).padStart(2, "0")}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#e8e4dc" } })
    .composite(layers)
    .jpeg({ quality: 78 })
    .toFile(file);
  console.log("  " + file);
}
