import nextEnv from '@next/env';
import fs from 'node:fs/promises';

nextEnv.loadEnvConfig(process.cwd(), true);
const api = process.env.STRAPI_API_URL || 'http://localhost:1443/api';
const token = process.env.STRAPI_READ_TOKEN || process.env.REST_API_KEY;
const articles = [];
let total = Infinity;
while (articles.length < total) {
  const response = await fetch(`${api}/news?populate[mainImage]=true&populate[gallery]=true&populate[attachments][populate]=*&sort[0]=id:asc&pagination[limit]=100&pagination[start]=${articles.length}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error(`News API: ${response.status}`);
  const body = await response.json();
  if (!body.data.length) break;
  articles.push(...body.data);
  total = body.meta.pagination.total;
}
const base = process.argv[2] || 'http://localhost:3000';
const paths = ['/news', '/news?page=2', '/news?search=несуществующаяновость', '/news?sort=publishedAt%3Aasc', '/news?page=99999', '/news/audit-missing-news', ...articles.map(a => `/news/${a.slug}`)];
const results = [];
for (const path of paths) {
  const started = performance.now();
  const response = await fetch(base + path, { headers: { 'User-Agent': 'Twitterbot' } });
  const html = await response.text();
  const meta = name => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1];
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  let schema; try { schema = schemaText ? JSON.parse(schemaText) : undefined; } catch { schema = 'invalid'; }
  const item = { path, status: response.status, htmlBytes: Buffer.byteLength(html), ms: Math.round(performance.now() - started),
    title: html.match(/<title>(.*?)<\/title>/)?.[1], canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1], description: meta('description'),
    robots: meta('robots'), ogTitle: meta('og:title'), ogImage: meta('og:image'), ogType: meta('og:type'),
    h1: (html.match(/<h1[\s>]/g) || []).length, schema: schema?.['@type'],
    schemaTitle: schema?.headline,
  };
  results.push(item);
  console.log(response.status, path);
}
const content = articles.map(a => ({ slug: a.slug, title: a.title, hasExcerpt: Boolean(a.excerpt?.trim()), hasContent: Boolean(a.content?.trim()),
  images: [a.mainImage, ...(a.gallery || [])].filter(Boolean).map(i => ({ url: i.url, alt: i.alternativeText, width: i.width, height: i.height })),
  attachments: (a.attachments || []).map(i => ({ kind: i.kind, title: i.title, provider: i.provider, hasCaptions: Boolean(i.captions), hasTranscript: Boolean(i.transcript) })) }));
const report = { created: new Date().toISOString(), total: articles.length, results, content };
const sitemapResponse = await fetch(base + '/sitemap.xml');
const sitemap = await sitemapResponse.text();
report.sitemap = { status: sitemapResponse.status, missingNews: articles.filter(a => !sitemap.includes(`/news/${a.slug}</loc>`)).map(a => a.slug) };
await fs.mkdir('../tmp/news-audit', { recursive: true });
await fs.writeFile('../tmp/news-audit/http.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ total: report.total, failed: results.filter(r => r.status !== (r.path.includes('99999') || r.path.includes('audit-missing') ? 404 : 200)), missingMetadata: results.filter(r => r.status === 200 && (!r.canonical || !r.description || !r.ogTitle || !r.ogImage || r.h1 !== 1)), contentIssues: content.filter(a => !a.hasContent || !a.hasExcerpt || a.attachments.length) }, null, 2));
if (report.sitemap.status !== 200 || report.sitemap.missingNews.length || results.some(r => r.status !== (r.path.includes('99999') || r.path.includes('audit-missing') ? 404 : 200) || (r.status === 200 && (!r.canonical || !r.description || !r.ogTitle || !r.ogImage || r.h1 !== 1 || (r.path.startsWith('/news/') && r.schema !== 'NewsArticle'))))) process.exitCode = 1;
