import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata } from "./page-metadata.ts";
import { campaignCatalogState } from "../campaigns/catalog-state.ts";

test("page metadata has its own canonical and social preview", () => {
  const metadata = pageMetadata("Отчётность", "Итоги работы", "/reports");
  assert.equal(metadata.alternates?.canonical, "/reports");
  assert.equal(metadata.openGraph?.title, "Отчётность");
  assert.equal(metadata.openGraph?.url, "/reports");
  assert.equal(metadata.twitter?.description, "Итоги работы");
  assert.ok(metadata.openGraph?.images);
});

test("campaign pagination keeps separate canonical URLs", () => {
  assert.equal(campaignCatalogState({}).canonical, "/campaigns");
  assert.equal(campaignCatalogState({ page: "2" }).canonical, "/campaigns?page=2");
  assert.equal(campaignCatalogState({ status: "closed", page: "2" }).canonical, "/campaigns?status=closed&page=2");
  assert.equal(campaignCatalogState({ status: "closed" }).noindex, false);
});

test("sorted campaign variants are not indexed", () => {
  for (const sort of ["date_asc", "collected_desc", "collected_asc"]) {
    assert.equal(campaignCatalogState({ sort }).noindex, true);
  }
  assert.equal(campaignCatalogState({ sort: "date_desc" }).noindex, false);
});

test("invalid or repeated pagination parameters never become CMS offsets", () => {
  for (const page of ["-1", "0", "1.5", "2junk", "Infinity", "9007199254740992", ["2", "3"]]) {
    assert.equal(campaignCatalogState({ page }).page, 1);
  }
  assert.deepEqual(campaignCatalogState({ status: "junk", sort: "junk" }), campaignCatalogState({}));
});
