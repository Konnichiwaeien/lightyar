import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('./news.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, console, require: path => {
  assert.equal(path, '../client');
  return { StrapiClient: class {} };
} });

test('news sitemap enumeration continues past a backend page boundary', async () => {
  const service = new exports.NewsService();
  const paths = [];
  service.fetchJson = async path => {
    paths.push(path);
    return paths.length === 1
      ? { data: [{ slug: 'one' }, { slug: 'two' }], meta: { pagination: { total: 3 } } }
      : { data: [{ slug: 'three' }], meta: { pagination: { total: 3 } } };
  };
  assert.equal(JSON.stringify(await service.getAllNewsSlugs()), '["one","two","three"]');
  assert.match(paths[1], /pagination\[start\]=2/);
});

test('catalog can omit unused galleries without changing report requests; tags are encoded', async () => {
  const service = new exports.NewsService();
  const paths = [];
  service.fetchJson = async path => { paths.push(path); return { data: [] }; };
  await service.getNews({ includeGallery: false, tag: 'home&pagination[limit]=999' });
  await service.getNews();
  assert.doesNotMatch(paths[0], /populate\[2\]=gallery/);
  assert.match(paths[0], /home%26pagination%5Blimit%5D%3D999/);
  assert.match(paths[1], /populate\[2\]=gallery/);
});
