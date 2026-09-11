import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { audit, LIMITS, verdict } from "../../scripts/audit-cutout.mjs";

/**
 * Приёмка вырезок обложки по стандарту из docs/pet-cutout-standard.md.
 *
 * Отбирали их на глаз и трижды подряд поставили на страницу плохие: срезанный
 * хвост, оторванную лапу, прилипший кусок забора. Теперь планка посчитана,
 * и негодная вырезка не доедет до страницы молча.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, "../../public/reports/pets");
const hero = fs.readFileSync(path.join(here, "reports-hero.tsx"), "utf8");

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();

test("в обложке есть вырезки", () => {
  assert.ok(files.length >= 3, `вырезок ${files.length}, нужно хотя бы три`);
});

for (const file of files) {
  test(`вырезка ${file} проходит стандарт`, async () => {
    const row = await audit(path.join(dir, file));
    const fails = verdict(row);
    assert.deepEqual(
      fails,
      [],
      `${file}: ${fails.join(", ")}. Пороги в docs/pet-cutout-standard.md, замер: ${JSON.stringify(row)}`,
    );
  });
}

test("обложка показывает ровно те вырезки, что лежат в папке", () => {
  const used = [...hero.matchAll(/\/reports\/pets\/([a-z0-9-]+)\.webp/g)].map((m) => m[1]).sort();
  const stored = files.map((f) => f.replace(".webp", ""));
  assert.deepEqual(used, stored, "список в reports-hero.tsx разошёлся с папкой public/reports/pets");
});

test("пороги стандарта не ослаблены незаметно", () => {
  // Планка снята с Капрала. Если её опустить, отсев перестанет работать,
  // поэтому числа продублированы здесь и в документе.
  assert.deepEqual(LIMITS, {
    срез: 12,
    куски: 1,
    вуаль: 3,
    рост: 1400,
    резкость: 6,
    плотность: 52,
    плита: 3,
    осанка: 1.2,
    симметрия: 55,
  });
});
