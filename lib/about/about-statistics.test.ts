import assert from "node:assert/strict";
import test from "node:test";
import { buildAboutStatisticSegments } from "./about-statistics.ts";

test("statistics segments preserve CMS order and calculate a complete composition", () => {
  const result = buildAboutStatisticSegments([
    { label: "собак", value: 63, qualifier: "exact", order: 10 },
    { label: "кошек", value: 9, qualifier: "exact", order: 20 },
  ]);

  assert.equal(result.total, 72);
  assert.equal(result.segments.length, 2);
  assert.equal(result.segments[0].share, 87.5);
  assert.equal(result.segments[1].share, 12.5);
  assert.equal(result.segments.at(-1)?.end, 360);
});

test("statistics segments ignore negative values and remain valid for an empty total", () => {
  const result = buildAboutStatisticSegments([
    { label: "неизвестно", value: -10, qualifier: "exact", order: 10 },
    { label: "пока нет", value: 0, qualifier: "exact", order: 20 },
  ]);

  assert.equal(result.total, 0);
  assert.deepEqual(result.segments.map((segment) => segment.share), [0, 0]);
  assert.equal(result.gradient, "rgba(255, 255, 255, 0.14) 0deg 360deg");
});
