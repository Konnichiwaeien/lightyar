/**
 * Полная проверка медиатеки: какие файлы числятся в Strapi, но отсутствуют в бакете.
 *
 * Битые ссылки посетитель видит пустыми местами вместо фотографий, а в логах
 * приложения их нет — 404 отдаёт бакет, а не Next.
 *
 *   node scripts/probe-media.mjs
 *   node scripts/probe-media.mjs --limit 50
 */
import fs from "node:fs";

const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const LIMIT = limitIndex !== -1 ? Number(args[limitIndex + 1]) : Infinity;
const CONCURRENCY = 8;

const env = fs.readFileSync(".env.development", "utf8");
const token = env.match(/^REST_API_KEY=(.*)$/m)[1].trim().replace(/"/g, "");
const base = "http://localhost:1443";

// Strapi отдаёт весь список одним ответом и параметры пагинации здесь игнорирует,
// поэтому забираем разом. Постраничный цикл на этом эндпоинте уходит в бесконечность.
async function allFiles() {
  const res = await fetch(`${base}/api/upload/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const items = Array.isArray(body) ? body : body.results || [];
  return items.filter((file) => /^https?:/.test(file.url)).slice(0, LIMIT);
}

const files = await allFiles();
process.stdout.write(`проверяю ${files.length} файлов…\n`);

const missing = [];
let done = 0;
const queue = [...files];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const file = queue.shift();
      try {
        const res = await fetch(file.url);
        // тело не читаем и сразу отменяем: иначе две тысячи картинок осядут в памяти
        await res.body?.cancel().catch(() => {});
        if (!res.ok) missing.push({ status: res.status, id: file.id, name: file.name });
      } catch {
        missing.push({ status: "сеть", id: file.id, name: file.name });
      }
      done += 1;
      if (done % 250 === 0) process.stdout.write(`  ${done}/${files.length}\n`);
    }
  }),
);

const share = files.length ? ((missing.length / files.length) * 100).toFixed(1) : "0";
console.log(`\nпроверено: ${files.length}`);
console.log(`недоступно: ${missing.length} (${share}%)`);

if (missing.length) {
  fs.writeFileSync("missing-media.json", JSON.stringify(missing, null, 1));
  console.log("полный список: missing-media.json");
  missing.slice(0, 8).forEach((item) => console.log(`  ${item.status}  id=${item.id}  ${String(item.name).slice(0, 55)}`));
}
