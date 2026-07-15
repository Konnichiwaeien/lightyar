import test from "node:test";
import assert from "node:assert/strict";
import {
  parseOptionalNumber,
  formatQualifiedValue,
  sortByOrder,
  sortReportsNewestFirst,
} from "./report-domain.ts";

test("optional money distinguishes missing values, zero, and decimal strings", () => {
  assert.equal(parseOptionalNumber(undefined), undefined);
  assert.equal(parseOptionalNumber(null), undefined);
  assert.equal(parseOptionalNumber(""), undefined);
  assert.equal(parseOptionalNumber("0.00"), 0);
  assert.equal(parseOptionalNumber("20509.71"), 20509.71);
  assert.equal(parseOptionalNumber("not-a-number"), undefined);
});

test("qualifiers are visible and deterministic", () => {
  assert.equal(formatQualifiedValue(60, "atLeast"), "60+");
  assert.equal(formatQualifiedValue(25, "exact"), "25");
  assert.equal(formatQualifiedValue(100, "approximately"), "≈100");
});

test("orders are stable and years are newest first", () => {
  assert.deepEqual(sortByOrder([{ order: 20 }, { order: 10 }]).map((item) => item.order), [10, 20]);
  assert.deepEqual(sortReportsNewestFirst([{ year: 2023 }, { year: 2025 }]).map((item) => item.year), [2025, 2023]);
});
