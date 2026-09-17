import assert from "node:assert/strict";
import test from "node:test";
import { donationSchema, donationErrors, donationAmountSchema } from "./donation-schema.ts";

const donor = { amount: 500, cadence: "once", anonymous: false, donorName: " Анна ", email: " anna@example.ru ", consent: true };

test("donation validates and trims personal fields for both cadences", () => {
  for (const cadence of ["once", "monthly"]) {
    const result = donationSchema.parse({ ...donor, cadence });
    assert.equal(result.anonymous, false);
    if (!result.anonymous) {
      assert.equal(result.donorName, "Анна");
      assert.equal(result.email, "anna@example.ru");
    }
  }
});

test("amount accepts whole rubles from 50 without requiring multiples of 50", () => {
  for (const amount of [50, 75, 500, " 751 "]) assert.equal(donationAmountSchema.parse(amount), Number(amount));
  for (const amount of ["", " ", 0, -50, 49, 50.5, "50.5", "1e3", "abc", Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(donationAmountSchema.safeParse(amount).success, false, String(amount));
  }
});

test("named donations report missing name, invalid email and unchecked consent", () => {
  const errors = donationErrors({ ...donor, donorName: "   ", email: "not-an-email", consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ["consent", "donorName", "email"]);
  assert.equal(donationSchema.safeParse({ ...donor, donorName: "Я" }).success, true);
  assert.equal(donationSchema.safeParse({ ...donor, donorName: "А".repeat(101) }).success, false);
});

test("anonymous donations omit hidden personal fields and do not require consent", () => {
  const result = donationSchema.parse({ ...donor, anonymous: true, email: "broken", consent: false });
  assert.deepEqual(result, { amount: 500, cadence: "once", anonymous: true });
  assert.deepEqual(donationErrors({ ...donor, anonymous: true, donorName: "", email: "", consent: false }), {});
});

test("empty custom amount cannot silently fall back to a preset", () => {
  assert.ok(donationErrors({ ...donor, amount: "" }).amount);
  assert.equal(donationSchema.safeParse({ ...donor, cadence: "weekly" }).success, false);
});
