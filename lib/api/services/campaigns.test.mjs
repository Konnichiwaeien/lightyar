import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync(new URL("./campaigns.ts", import.meta.url), "utf8");
function service(answer) {
  const calls = [];
  class Client { async fetchJson(path) { calls.push(path); return answer(path); } }
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", output)(() => ({ StrapiClient: Client }), exports);
  return { client: new exports.CampaignsService(), calls };
}
test("readable URLs use one encoded slug query", async () => {
  const fund = { documentId: "a", slug: "korm" };
  const { client, calls } = service(() => ({ data: [fund] }));
  assert.equal(await client.getCampaignByIdOrSlug("korm"), fund);
  assert.equal(calls.length, 1);
  assert.match(calls[0], /filters\[slug\]\[\$eq\]=korm/);
});
test("existing ID URLs still load the same document", async () => {
  const fund = { documentId: "vkog00to6dygwiq8tefuy1r9", slug: "korm" };
  const { client, calls } = service(() => ({ data: fund }));
  assert.equal(await client.getCampaignByIdOrSlug(fund.documentId), fund);
  assert.equal(calls.length, 1);
});
test("a 24-character slug may fall back after a missing document, but API failures must propagate", async () => {
  const { client, calls } = service(path => {
    if (!path.includes("filters")) throw new Error("Strapi API Error: 404 Not Found");
    return { data: [] };
  });
  assert.equal(await client.getCampaignByIdOrSlug("a".repeat(24)), null);
  assert.equal(calls.length, 2);
  const failed = service(() => { throw new Error("503 Unavailable"); });
  await assert.rejects(failed.client.getCampaignByIdOrSlug("a".repeat(24)), /503/);
  assert.equal(failed.calls.length, 1);
});
