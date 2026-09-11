import test from "node:test";
import assert from "node:assert/strict";
import { ABOUT_FALLBACK, mergeAboutContent } from "./about-content.ts";
import { applyRussianTypography } from "../typography.ts";

test("missing CMS content falls back without erasing provided fields or confirmed zeroes", () => {
  const result = mergeAboutContent({
    heroTitle: "Новый заголовок",
    currentStats: [
      { label: "Тест", value: 0, qualifier: "exact", order: 1 },
    ],
  });

  assert.equal(result.heroTitle, "Новый заголовок");
  assert.equal(result.missionBody, applyRussianTypography(ABOUT_FALLBACK.missionBody));
  assert.equal(result.currentStats[0].value, 0);
  assert.ok(result.faqItems.length > 0);
});

test("empty managed arrays preserve the useful fallback", () => {
  const result = mergeAboutContent({ teamMembers: [], faqItems: [] });
  assert.deepEqual(
    result.teamMembers.map((member) => member.name),
    ABOUT_FALLBACK.teamMembers.map((member) => member.name),
  );
  assert.deepEqual(
    result.faqItems.map((item) => item.question),
    ABOUT_FALLBACK.faqItems.map((item) => applyRussianTypography(item.question)),
  );
});

/**
 * Типографику применяем в самом слиянии, чтобы редактор в CMS не расставлял
 * неразрывные пробелы руками: предлог, повисший в конце строки, читается
 * как опечатка.
 */
test("every text field passes through Russian typography, CMS content included", () => {
  const result = mergeAboutContent({
    heroIntro: "Мы  помогаем животным в беде - каждый день.",
    teamMembers: [{ name: "Тест", role: "Волонтёр", bio: "Работает с собаками и с кошками.", quote: "Я в деле - и надолго.", order: 1 }],
    faqItems: [{ question: "А как помочь?", answer: "Приходите к нам в приют.", order: 1 }],
  });

  // Однобуквенное слово держится за следующее, тире — за предыдущее.
  assert.match(result.heroIntro, /в беде — каждый день/);
  assert.doesNotMatch(result.heroIntro, / {2}/);
  assert.match(result.teamMembers[0].bio ?? "", /с собаками и с кошками/);
  assert.match(result.teamMembers[0].quote ?? "", /Я в деле — и надолго/);
  assert.match(result.faqItems[0].question, /А как помочь\?/);
  assert.match(result.faqItems[0].answer, /к нам в приют/);

  // Запасной материал проходит ту же обработку.
  assert.ok(mergeAboutContent().historyBody.includes(" "));
});

test("local fallback media uses real group photography, never a generic placeholder", () => {
  const result = mergeAboutContent();
  const sectionMedia = [
    result.heroPoster,
    result.directionsImage,
    result.historyImage,
    result.resultsImage,
    result.faqImage,
    result.volunteerPoster,
  ];

  assert.ok(sectionMedia.every((item) => item?.startsWith("/about/real/")));
  assert.equal(result.teamMembers.find((member) => member.name === "Светлана Клюкина")?.photo, "/about/real/team/svetlana-klyukina.jpg");
  assert.doesNotMatch(JSON.stringify(result), /photo-placeholder\.jpg/);
  assert.equal(result.heroVideo, undefined);
  assert.equal(result.volunteerVideo, undefined);
});

test("verified fallback portraits fill missing CMS photos without overwriting CMS media", () => {
  const members = ABOUT_FALLBACK.teamMembers.map((member) => ({ ...member, photo: undefined }));
  const merged = mergeAboutContent({ teamMembers: members });
  assert.equal(merged.teamMembers.find((member) => member.name === "Светлана Клюкина")?.photo, "/about/real/team/svetlana-klyukina.jpg");

  const cmsPhoto = mergeAboutContent({
    teamMembers: members.map((member) => member.name === "Светлана Клюкина" ? { ...member, photo: "/uploads/svetlana.jpg" } : member),
  });
  assert.equal(cmsPhoto.teamMembers.find((member) => member.name === "Светлана Клюкина")?.photo, "/uploads/svetlana.jpg");
});
