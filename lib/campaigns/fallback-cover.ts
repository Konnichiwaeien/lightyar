/** Illustrative still lifes, never a substitute portrait of a named animal. */
export function campaignFallbackCover(title = ""): string {
  if (/корм|питан|еда|миск/i.test(title)) return "/campaigns/covers/food.webp";
  if (/лекар|клещ|капл|препарат|вакцин|лечен|операци|стерилиз/i.test(title)) return "/campaigns/covers/medicine.webp";
  return "/campaigns/covers/rehabilitation.webp";
}
