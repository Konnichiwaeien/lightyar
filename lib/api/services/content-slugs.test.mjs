import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function service(kind, answer) {
  const calls = [];
  class Client { async fetchJson(path) { calls.push(path); return answer(path); } }
  const source = fs.readFileSync(new URL(`./${kind}.ts`, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(() => ({ StrapiClient: Client }), exports);
  const client = new exports[kind === 'pets' ? 'PetsService' : 'NewsService']();
  return { client, calls, lookup: value => kind === 'pets' ? client.getPetByIdOrSlug(value) : client.getNewsBySlug(value) };
}

for (const kind of ['pets', 'news']) {
  test(`${kind}: current slugs resolve in one request`, async () => {
    const item = { documentId: 'a'.repeat(24), slug: 'alva' };
    const { lookup, calls } = service(kind, () => ({ data: [item] }));
    assert.equal(await lookup('alva'), item);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /filters\[slug\]\[\$eq\]=alva/);
  });

  test(`${kind}: old document IDs return the original document`, async () => {
    const item = { documentId: 'a'.repeat(24), slug: 'alma' };
    const { lookup } = service(kind, path => ({ data: path.includes('?filters') ? [] : item }));
    assert.equal(await lookup(item.documentId), item);
  });

  test(`${kind}: invalid aliases never reach the API; unavailable API is not a 404`, async () => {
    const { lookup, calls } = service(kind, () => { throw new Error('503 unavailable'); });
    assert.equal(await lookup('|alma|'), null);
    assert.equal(calls.length, 0);
    await assert.rejects(lookup('alma'), /503/);
    const missing = service(kind, () => ({ data: [] }));
    assert.equal(await missing.lookup('missing'), null);
  });
}

test('pet sitemap walks every backend page and preserves stable IDs separately', async () => {
  const { client, calls } = service('pets', path => path.includes('start]=0')
    ? { data: [{ documentId: 'one', slug: 'alma' }, { documentId: 'two', slug: 'alma-2' }], meta: { pagination: { total: 3 } } }
    : { data: [{ documentId: 'three', slug: 'alva' }], meta: { pagination: { total: 3 } } });
  assert.deepEqual(await client.getAllPetIdentifiers(), [{ id: 'one', slug: 'alma' }, { id: 'two', slug: 'alma-2' }, { id: 'three', slug: 'alva' }]);
  assert.match(calls[1], /pagination\[start\]=2/);
});
