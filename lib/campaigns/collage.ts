import fs from "node:fs";
import path from "node:path";

/**
 * Есть ли на диске вырезки предметов для коллажа.
 *
 * Они заказаны брифом `docs/asset-brief-campaigns-collage.md` и снимаются в
 * приюте. Пока их нет, секция «Куда уходит взнос» собирается без предметов:
 * плоское поле, геометрия и крупные числа. Это законченный вид, а не заглушка,
 * и он сам дополнится, когда файлы лягут в папку.
 *
 * Проверка идёт по файловой системе, а не по списку в коде: список пришлось бы
 * править руками ровно в тот момент, когда про него забудут.
 */

const ART_DIR = path.join(process.cwd(), "public", "campaigns");

/** Имя вырезки по тегу сбора. Теги приходят из CMS и совпадают с брифом. */
const ART: Record<string, string> = {
  Корм: "need-food",
  Медицина: "need-meds",
  Реабилитация: "need-rehab",
  Срочно: "need-warm",
};

export function needArt(tag: string): string | null {
  const name = ART[tag];
  if (!name) return null;
  try {
    return fs.existsSync(path.join(ART_DIR, `${name}.webp`)) ? `/campaigns/${name}.webp` : null;
  } catch {
    return null;
  }
}
