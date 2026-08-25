import fs from "node:fs";
const token = fs.readFileSync(".env.development", "utf8").match(/^REST_API_KEY=(.*)$/m)[1].trim().replace(/"/g, "");
const res = await fetch("http://localhost:1443/api/campaigns?status=published&pagination[pageSize]=50&populate[images][fields][0]=url&populate[pet][populate][photos][fields][0]=url", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
for (const c of data) {
  const urls = [
    ...(c.images || []).map((i) => ["обложка сбора", i.url]),
    ...((c.pet?.photos) || []).slice(0, 3).map((i) => ["фото питомца", i.url]),
  ];
  const broken = [];
  for (const [kind, url] of urls) {
    if (!/^https?:/.test(url)) continue;
    const r = await fetch(url).then((x) => { x.body?.cancel().catch(() => {}); return x.status; }).catch(() => "сеть");
    if (r !== 200) broken.push(`${kind} (${r})`);
  }
  console.log(`${broken.length ? "✗" : "✓"} «${c.title}» — картинок ${urls.length}, битых ${broken.length}${broken.length ? ": " + broken.join(", ") : ""}`);
}
