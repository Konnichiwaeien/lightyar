import assert from "node:assert/strict";
import test from "node:test";
import { getDonationTier } from "./get-donation-tier.ts";

test("maps arbitrary amounts to the greatest configured threshold", () => {
  assert.equal(getDonationTier(-1).id, "food");
  assert.equal(getDonationTier(0).id, "food");
  assert.equal(getDonationTier(299).id, "food");
  assert.equal(getDonationTier(300).id, "food");
  assert.equal(getDonationTier(499).id, "food");
  assert.equal(getDonationTier(500).id, "care");
  assert.equal(getDonationTier(999).id, "care");
  assert.equal(getDonationTier(1000).id, "diagnostics");
  assert.equal(getDonationTier(2999).id, "diagnostics");
  assert.equal(getDonationTier(3000).id, "treatment");
  assert.equal(getDonationTier(9999).id, "treatment");
  assert.equal(getDonationTier(Number.NaN).id, "food");
  assert.equal(getDonationTier(Number.POSITIVE_INFINITY).id, "food");
});
