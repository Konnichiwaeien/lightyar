import assert from "node:assert/strict";
import test from "node:test";
import { buildPetStats } from "./pet-stats.ts";

const pet = (over: Partial<Parameters<typeof buildPetStats>[0][number]> = {}) => ({
  petStatus: "shelter",
  type: "dog",
  intakeDate: "2025-03-01",
  adoptedAt: null,
  undergoingTreatment: false,
  ...over,
});

test("counts split care and adoption without double-counting", () => {
  const stats = buildPetStats([
    pet(),
    pet({ type: "cat" }),
    pet({ petStatus: "home", adoptedAt: "2025-09-19" }),
    pet({ undergoingTreatment: true }),
  ]);

  assert.equal(stats.total, 4);
  assert.equal(stats.inCare, 3);
  assert.equal(stats.adopted, 1);
  assert.equal(stats.inTreatment, 1);
  assert.equal(stats.dogs, 3);
  assert.equal(stats.cats, 1);
});

test("treatment counts only animals still in care", () => {
  const stats = buildPetStats([
    pet({ petStatus: "home", adoptedAt: "2025-09-19", undergoingTreatment: true }),
  ]);
  assert.equal(stats.inTreatment, 0, "уехавший домой не должен попадать в «на лечении»");
});

test("year slices separate intake from adoption", () => {
  const stats = buildPetStats([
    pet({ intakeDate: "2024-10-28" }),
    pet({ intakeDate: "2025-01-05" }),
    pet({ intakeDate: "2024-12-01", petStatus: "home", adoptedAt: "2025-11-11" }),
  ]);

  assert.deepEqual(stats.years, [
    { year: 2024, intake: 2, adopted: 0 },
    { year: 2025, intake: 1, adopted: 1 },
  ]);
});

test("records without an intake date stay counted but are reported separately", () => {
  const stats = buildPetStats([pet({ intakeDate: null }), pet()]);
  assert.equal(stats.total, 2);
  assert.equal(stats.withoutIntakeDate, 1);
  assert.deepEqual(stats.years, [{ year: 2025, intake: 1, adopted: 0 }]);
});

test("adoption timeline is cumulative and keeps empty months", () => {
  const stats = buildPetStats([
    pet({ petStatus: "home", adoptedAt: "2025-09-19" }),
    pet({ petStatus: "home", adoptedAt: "2025-12-09" }),
    pet({ petStatus: "home", adoptedAt: "2025-12-11" }),
  ]);

  assert.deepEqual(stats.adoptionTimeline, [
    { month: "2025-09", total: 1 },
    { month: "2025-10", total: 1 },
    { month: "2025-11", total: 1 },
    { month: "2025-12", total: 3 },
  ]);
});

test("timeline crosses the year boundary", () => {
  const stats = buildPetStats([
    pet({ petStatus: "home", adoptedAt: "2025-11-30" }),
    pet({ petStatus: "home", adoptedAt: "2026-02-20" }),
  ]);

  assert.deepEqual(
    stats.adoptionTimeline.map((point) => point.month),
    ["2025-11", "2025-12", "2026-01", "2026-02"],
  );
  assert.equal(stats.adoptionTimeline.at(-1)?.total, 2);
});

test("no adoptions yields an empty timeline instead of a flat line", () => {
  const stats = buildPetStats([pet(), pet()]);
  assert.deepEqual(stats.adoptionTimeline, []);
});
