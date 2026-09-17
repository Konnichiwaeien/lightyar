import { chromium } from 'playwright-core';
import nextEnv from '@next/env';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

nextEnv.loadEnvConfig(process.cwd());
const base = process.argv[2] || 'http://localhost:3000';
const api = process.env.STRAPI_API_URL || 'http://localhost:1443/api';
const token = process.env.STRAPI_READ_TOKEN || process.env.REST_API_KEY;
const headers = token ? { Authorization: `Bearer ${token}` } : {};
async function read(path) {
  const response = await fetch(api + path, { headers });
  assert.equal(response.status, 200, `${path}: ${response.status} ${response.ok ? '' : await response.text()}`);
  return response.json();
}
const { data: pets } = await read('/pets?pagination[limit]=100&fields[0]=name&fields[1]=slug');
const pet = pets.find(item => item.documentId === 'uvpj4x6wdj2urazegzoxcqtf') || pets[0];
const { data: news } = await read('/news?pagination[limit]=1&fields[0]=title&fields[1]=slug');
assert.equal(new Set(pets.map(item => item.slug)).size, pets.length);
assert.ok(pets.every(item => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)));
await fs.mkdir('../tmp/content-slugs', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const report = [];
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  await page.setExtraHTTPHeaders({ 'Cache-Control': 'no-cache' });
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) console.log('Navigated', frame.url()); });
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/pets/${pet.documentId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(slug => location.pathname === `/pets/${slug}`, pet.slug, { timeout: 20000 });
    console.log('Pet redirect passed', width);
    await page.locator('#pet-name').waitFor();
    assert.equal(await page.locator('#pet-name').innerText(), pet.name);
    assert.ok((await page.locator('link[rel="canonical"]').getAttribute('href')).endsWith(`/pets/${pet.slug}`));
    const favorite = page.locator('.pet-profile__favorite');
    await favorite.click();
    console.log('Favorite clicked', await favorite.getAttribute('aria-pressed'), await page.evaluate(() => localStorage.getItem('pet-favorites')));
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('pet-favorites') || '[]').includes(id), pet.documentId);
    assert.equal(await page.evaluate(slug => JSON.parse(localStorage.getItem('pet-favorites') || '[]').includes(slug), pet.slug), false);
    await favorite.click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => { const img = document.querySelector('.pet-gallery__image'); return img?.complete && img.naturalWidth > 0; }, null, { timeout: 60000 });
    await page.screenshot({ path: `../tmp/content-slugs/pet-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    report.push({ width, url: page.url(), canonical: await page.locator('link[rel="canonical"]').getAttribute('href'), favoritesUseDocumentId: true });
  }
  const article = news[0];
  await page.goto(`${base}/news/${article.documentId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(slug => location.pathname === `/news/${slug}`, article.slug, { timeout: 20000 });
  assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim(), article.title.replace(/\s+/g, ' ').trim());
  assert.ok((await page.locator('link[rel="canonical"]').getAttribute('href')).endsWith(`/news/${article.slug}`));
  report.push({ newsIdRedirect: true, url: page.url() });
  await page.goto(`${base}/pets`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('.pet-entry__cta').first().waitFor();
  const links = await page.locator('.pet-entry__cta').evaluateAll(items => items.map(item => item.getAttribute('href')));
  assert.ok(links.every(href => !/^\/pets\/[a-z0-9]{24}$/.test(href)));
  const sitemap = await page.request.get(`${base}/sitemap.xml`, { timeout: 60000 });
  const xml = await sitemap.text();
  assert.ok(xml.includes(`/pets/${pet.slug}</loc>`));
  assert.ok(!xml.includes(`/pets/${pet.documentId}</loc>`));
  assert.ok(!xml.match(/\/pets\/[a-z0-9]{24}<\/loc>/));
  report.push({ catalogSlugs: links, sitemap: 'passed' });
  const developmentTimingWarnings = errors.filter(message => message.includes("Failed to execute 'measure'") && message.includes('negative time stamp'));
  assert.deepEqual(errors.filter(message => !developmentTimingWarnings.includes(message)), []);
  await fs.writeFile('../tmp/content-slugs/report.json', JSON.stringify({ report, errors: errors.filter(message => !developmentTimingWarnings.includes(message)), developmentTimingWarnings }, null, 2));
  console.log(JSON.stringify({ report, errors }, null, 2));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) { console.log('FAIL STATE', page.url(), await page.locator('h1').allTextContents(), await page.locator('link[rel=canonical]').getAttribute('href'), errors); await page.screenshot({ path: '../tmp/content-slugs/failure.png' }); }
  throw error;
} finally { await browser.close(); }
