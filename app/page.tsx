import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { DogsStoriesSection } from "@/components/sections/dogs-stories-section";
import { CampaignsSection } from "@/components/sections/campaigns-section";
import { PaymentSection } from "@/components/sections/payment-section";
import { NeedsSection } from "@/components/sections/needs-section";
import { RescuedRing } from "@/components/sections/rescued-ring";
import { petStatsService } from "@/lib/api/services/pet-stats";
import { EMPTY_PET_STATS, type PetStats } from "@/lib/reports/pet-stats";
import { wishlistService, type WishlistItem, type WishlistSettings } from "@/lib/api/services/wishlist";
import { VolunteerSection } from "@/components/sections/volunteer-section";
import { NewsSection } from "@/components/sections/news-section";
import { HomeHeader } from "@/components/home/home-header";
import { ColorTransitionWrapper } from "@/components/home/color-transition-wrapper";
import { newsService } from "@/lib/api/services/news";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { donationsService } from "@/lib/api/services/donations";
import { siteMediaService, type SiteMedia } from "@/lib/api/services/site-media";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";
import { normalizeCampaignData, MappedCampaign } from "@/lib/helpers/campaigns/normalize-campaign-data";

export default async function Home() {
  let news: Awaited<ReturnType<typeof newsService.getLatestNews>> = [];
  let petsInShelter: { id: string; name: string; tag: string; image: string }[] = [];
  let activeCampaigns: MappedCampaign[] = [];
  let donationFeed: DonationFeedState = { status: "unavailable", items: [] };
  let siteMedia: SiteMedia = {};
  let wishlistItems: WishlistItem[] = [];
  let wishlistSettings: WishlistSettings = { marketplaceName: "Ozon" };
  let petStats: PetStats = EMPTY_PET_STATS;

  try {
    const [newsResult, realPetsRaw, campaignsRaw, donationsRaw, siteMediaRaw, wishlistRaw, wishlistSettingsRaw, petStatsRaw] =
      await Promise.all([
        newsService.getLatestNews(5),
        petsService.getPets({ status: "shelter", limit: 5 }).then(r => r || []),
        campaignsService.getCampaigns({ status: "active", limit: 3 }),
        donationsService.getRecentDonations(20),
        siteMediaService.getSiteMedia(),
        wishlistService.getItems(),
        wishlistService.getSettings(),
        petStatsService.getPetStats(),
      ]);

    siteMedia = siteMediaRaw;
    petStats = petStatsRaw;
    wishlistItems = wishlistRaw;
    wishlistSettings = wishlistSettingsRaw;

    news = newsResult;

    donationFeed = donationsRaw.status === "ready"
      ? {
          status: "ready",
          items: donationsRaw.donations.map((donation) => ({
            name: donation.donorName || "Анонимный помощник",
            amount: donation.amount,
            type: donation.type,
          })),
        }
      : { status: donationsRaw.status, items: [] };

    petsInShelter = realPetsRaw
      .map(normalizePetData)
      .map((pet) => ({
        id: String(pet.id),
        name: pet.name,
        tag: pet.tag,
        image: pet.image
      }));

    activeCampaigns = (campaignsRaw.data || []).map(normalizeCampaignData);
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  return (
    <ColorTransitionWrapper
      lightZone={
        <>
          <HomeHeader />
          <HeroSection videoUrl={siteMedia.heroVideo} posterUrl={siteMedia.heroPoster} />
          <AboutSection
            imageUrl={siteMedia.homeAbout}
            total={petStats.total}
            dogs={petStats.dogs}
            cats={petStats.cats}
            adopted={petStats.adopted}
          />
          <RescuedRing
            total={petStats.total}
            looking={petStats.inCare}
            dogs={petStats.dogs}
            cats={petStats.cats}
          />
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
          <NewsSection initialNews={news} />
        </>
      }
    />
  );
}
