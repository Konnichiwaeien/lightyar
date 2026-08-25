/** Ищет записи, которые ссылаются на отсутствующие в бакете файлы */
import fs from "node:fs";

const token = fs.readFileSync(".env.development", "utf8").match(/^REST_API_KEY=(.*)$/m)[1].trim().replace(/"/g, "");
const base = "http://localhost:1443";
const missing = new Set(JSON.parse(fs.readFileSync("missing-media.json", "utf8")).map((m) => m.id));

const targets = [
  ["Питомец", "pets", "populate[photos][fields][0]=url", (e) => e.photos],
  ["Сбор", "campaigns", "populate[images][fields][0]=url", (e) => e.images],
  ["Новость", "news", "populate[mainImage][fields][0]=url&populate[gallery][fields][0]=url", (e) => [...(e.mainImage ? [e.mainImage] : []), ...(e.gallery || [])]],
];

for (const [label, path, populate, pick] of targets) {
  const res = await fetch(`${base}/api/${path}?status=published&pagination[pageSize]=200&fields[0]=name&fields[1]=title&${populate}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const hits = (body.data || []).filter((entry) => (pick(entry) || []).some((m) => m && missing.has(m.id)));
  console.log(`${label}: записей с битыми файлами — ${hits.length}`);
  hits.slice(0, 10).forEach((h) => console.log(`   ${h.name || h.title || h.documentId}`));
}
