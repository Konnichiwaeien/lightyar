/** Проверяет доступность файлов медиатеки в бакете */
import fs from "node:fs";

const token = fs.readFileSync(".env.development", "utf8").match(/^REST_API_KEY=(.*)$/m)[1].trim().replace(/"/g, "");
const res = await fetch("http://localhost:1443/api/upload/files?pagination[pageSize]=60", {
  headers: { Authorization: `Bearer ${token}` },
});
const files = await res.json();
const urls = files.filter((f) => /^https?:/.test(f.url)).slice(0, 30);

let ok = 0;
const bad = [];
for (const f of urls) {
  try {
    const r = await fetch(f.url, { method: "GET" });
    if (r.ok) ok += 1;
    else bad.push({ status: r.status, name: f.name.slice(0, 50) });
  } catch (e) {
    bad.push({ status: "сеть", name: f.name.slice(0, 50) });
  }
}
console.log(`всего файлов в медиатеке: ${files.length >= 60 ? "60+" : files.length}`);
console.log(`проверено: ${urls.length} | доступно: ${ok} | недоступно: ${bad.length}`);
bad.slice(0, 5).forEach((b) => console.log(`  ${b.status}  ${b.name}`));
