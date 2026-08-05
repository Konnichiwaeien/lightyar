import test from "node:test";
import assert from "node:assert/strict";
import { ABOUT_FALLBACK, mergeAboutContent } from "./about-content.ts";

test("missing CMS content falls back without erasing provided fields or confirmed zeroes", () => {
  const result = mergeAboutContent({
    heroTitle: "Новый заголовок",
    currentStats: [
      { label: "Тест", value: 0, qualifier: "exact", order: 1 },
    ],
  });

  assert.equal(result.heroTitle, "Новый заголовок");
  assert.equal(result.missionBody, ABOUT_FALLBACK.missionBody);
  assert.equal(result.currentStats[0].value, 0);
  assert.ok(result.faqItems.length > 0);
});

test("empty managed arrays preserve the useful fallback", () => {
  const result = mergeAboutContent({ teamMembers: [], faqItems: [] });
  assert.deepEqual(result.teamMembers, ABOUT_FALLBACK.teamMembers);
  assert.deepEqual(result.faqItems, ABOUT_FALLBACK.faqItems);
});
