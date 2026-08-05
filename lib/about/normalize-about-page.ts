import type { StrapiAboutPage, StrapiMedia } from "../api/types";
import { parseOptionalNumber } from "../reports/report-domain.ts";
import {
  mergeAboutContent,
  type AboutFaqItem,
  type AboutPageContent,
  type AboutStatistic,
  type AboutTeamMember,
} from "./about-content";

function resolveMedia(
  media: StrapiMedia | null | undefined,
  resolveMediaUrl: (url: string) => string,
): string | undefined {
  return media?.url ? resolveMediaUrl(media.url) : undefined;
}

export function normalizeAboutPage(
  page: StrapiAboutPage,
  resolveMediaUrl: (url: string) => string,
): AboutPageContent {
  const currentStats = (page.currentStats || []).flatMap<AboutStatistic>((item) => {
    const value = parseOptionalNumber(item.value);
    if (value === undefined) return [];
    return [{
      id: item.id,
      label: item.label,
      value,
      qualifier: item.qualifier,
      unit: item.unit?.trim() || undefined,
      order: item.order ?? 0,
    }];
  });

  const teamMembers = (page.teamMembers || []).map<AboutTeamMember>((item) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    city: item.city?.trim() || undefined,
    bio: item.bio?.trim() || undefined,
    quote: item.quote?.trim() || undefined,
    photo: resolveMedia(item.photo, resolveMediaUrl),
    order: item.order ?? 0,
  }));

  const faqItems = (page.faqItems || []).map<AboutFaqItem>((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    order: item.order ?? 0,
  }));

  return mergeAboutContent({
    heroTitle: page.heroTitle || undefined,
    heroIntro: page.heroIntro || undefined,
    heroVideo: resolveMedia(page.heroVideo, resolveMediaUrl),
    heroPoster: resolveMedia(page.heroPoster, resolveMediaUrl),
    missionTitle: page.missionTitle || undefined,
    missionBody: page.missionBody || undefined,
    directionsImage: resolveMedia(page.directionsImage, resolveMediaUrl),
    historyTitle: page.historyTitle || undefined,
    historyBody: page.historyBody || undefined,
    historyImage: resolveMedia(page.historyImage, resolveMediaUrl),
    currentStats,
    teamMembers,
    resultsTitle: page.resultsTitle || undefined,
    resultsBody: page.resultsBody || undefined,
    resultsImage: resolveMedia(page.resultsImage, resolveMediaUrl),
    volunteerTitle: page.volunteerTitle || undefined,
    volunteerBody: page.volunteerBody || undefined,
    volunteerVideo: resolveMedia(page.volunteerVideo, resolveMediaUrl),
    volunteerPoster: resolveMedia(page.volunteerPoster, resolveMediaUrl),
    faqItems,
    faqImage: resolveMedia(page.faqImage, resolveMediaUrl),
    reportsTitle: page.reportsTitle || undefined,
    reportsBody: page.reportsBody || undefined,
  });
}
