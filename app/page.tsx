import { HeroSection } from "@/components/sections/hero-section";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };
import { AboutSection } from "@/components/sections/about-section";
import { DogsStoriesSection } from "@/components/sections/dogs-stories-section";
import { CampaignsSection } from "@/components/sections/campaigns-section";
import { PaymentSection } from "@/components/sections/payment-section";
import { NeedsSection } from "@/components/sections/needs-section";
import { RescuedRing } from "@/components/sections/rescued-ring";
import { petStatsService } from "@/lib/api/services/pet-stats";
import { EMPTY_PET_STATS } from "@/lib/reports/pet-stats";
import { wishlistService } from "@/lib/api/services/wishlist";
import { VolunteerSection } from "@/components/sections/volunteer-section";
import { NewsSection } from "@/components/sections/news-section";
import { HomeHeader } from "@/components/home/home-header";
import { ColorTransitionWrapper } from "@/components/home/color-transition-wrapper";
import { newsService } from "@/lib/api/services/news";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { donationsService } from "@/lib/api/services/donations";
import { siteMediaService } from "@/lib/api/services/site-media";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";

export default async function Home() {
  const results = await Promise.allSettled([
        newsService.getLatestNews(5),
        petsService.getPets({ status: "shelter", limit: 5 }).then(r => r || []),
        campaignsService.getCampaigns({ status: "active", limit: 3 }),
        donationsService.getRecentDonations(20),
        siteMediaService.getSiteMedia(),
        wishlistService.getItems(),
        wishlistService.getSettings(),
        petStatsService.getPetStats({ throwOnError: true }),
      ]);
  const names = ["news", "pets", "campaigns", "donations", "media", "wishlist", "wishlist settings", "statistics"];
  results.forEach((result, index) => {
    if (result.status === "rejected") console.error(`[Home] ${names[index]} unavailable`);
  });
  const [newsResult, petsResult, campaignsResult, donationsResult, mediaResult, wishlistResult, settingsResult, statsResult] = results;
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const siteMedia = mediaResult.status === "fulfilled" ? mediaResult.value : {};
  const petStats = statsResult.status === "fulfilled" ? statsResult.value : EMPTY_PET_STATS;
  const wishlistItems = wishlistResult.status === "fulfilled" ? wishlistResult.value : [];
  const wishlistSettings = settingsResult.status === "fulfilled" ? settingsResult.value : { marketplaceName: "Ozon" };
  const donationsRaw = donationsResult.status === "fulfilled" ? donationsResult.value : { status: "unavailable" as const };
  const donationFeed: DonationFeedState = donationsRaw.status === "ready"
      ? {
          status: "ready",
          items: donationsRaw.donations.map((donation) => ({
            name: donation.donorName || "Анонимный помощник",
            amount: donation.amount,
            type: donation.type,
          })),
        }
      : { status: donationsRaw.status, items: [] };

  const petsInShelter = (petsResult.status === "fulfilled" ? petsResult.value : [])
      .map(normalizePetData)
      .map((pet) => ({
        id: String(pet.id),
        name: pet.name,
        tag: pet.tag,
        image: pet.image
      }));

  const activeCampaigns = (campaignsResult.status === "fulfilled" ? campaignsResult.value.data || [] : []).map(normalizeCampaignData);

  return (
    <ColorTransitionWrapper
      lightZone={
        <>
          <HomeHeader />
          <HeroSection videoUrl={siteMedia.heroVideo} posterUrl={siteMedia.heroPoster} />
          <AboutSection
            statsAvailable={statsResult.status === "fulfilled"}
            imageUrl={siteMedia.homeAbout}
            total={petStats.total}
            dogs={petStats.dogs}
            cats={petStats.cats}
            adopted={petStats.adopted}
          />
          {statsResult.status === "fulfilled" && <RescuedRing
            total={petStats.total}
            looking={petStats.inCare}
            dogs={petStats.dogs}
            cats={petStats.cats}
          />}
          <DogsStoriesSection initialPets={petsInShelter} />
        </>
      }
      darkZoneTrigger={
        <CampaignsSection initialCampaigns={activeCampaigns} />
      }
      darkZone={
        <>
          <PaymentSection feed={donationFeed} />
          <NeedsSection items={wishlistItems} settings={wishlistSettings} />
          <VolunteerSection imageUrl={siteMedia.homeAbout} />
          <NewsSection initialNews={news} unavailable={newsResult.status === "rejected"} />
        </>
      }
    />
  );
}
