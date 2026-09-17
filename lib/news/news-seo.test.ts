import test from "node:test";
import assert from "node:assert/strict";
import { newsCatalogState, newsDescription, newsArticleSchema, serializeNewsSchema } from "./news-seo.ts";
import type { StrapiNews } from "../api/types.ts";

test("pagination has its own canonical; filtered and sorted lists are noindex", () => {
  const second = newsCatalogState({ page: "2", utm_source: "vk" });
  assert.match(second.canonical, /\/news\?page=2$/);
  assert.equal(second.noindex, false);
  for (const params of [{ search: "Сильвия" }, { tag: "doma" }, { sort: "publishedAt:asc" }]) {
    assert.equal(newsCatalogState(params).noindex, true);
  }
  assert.equal(newsCatalogState({ page: "-4" }).page, 1);
  assert.equal(newsCatalogState({ page: "1.5" }).page, 1);
  assert.equal(newsCatalogState({ search: "  " }).noindex, false);
});

test("descriptions use real article content without Markdown or excess whitespace", () => {
  assert.equal(newsDescription({ content: "Привет от [Сильвии](https://example.org).\n\nОна дома!" }), "Привет от Сильвии. Она дома!");
  assert.ok(newsDescription({ content: "Помощь приюту. ".repeat(50) }).length <= 180);
});

test("structured data uses actual dates and cannot close its script element", () => {
  const article = { title: "История </script><script>alert(1)</script>", slug: "story", content: "История", publishedAt: "2026-05-20T12:00:00Z", updatedAt: "invalid" } as StrapiNews;
  const schema = newsArticleSchema(article, ["https://example.org/photo.jpg"]);
  assert.equal(schema.datePublished, "2026-05-20T12:00:00.000Z");
  assert.equal(schema.dateModified, undefined);
  assert.equal(schema.headline, article.title);
  const serialized = serializeNewsSchema(schema);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized).headline, article.title);
});
