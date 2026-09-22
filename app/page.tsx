import { HeroSection } from "@/components/sections/hero-section";
import { Suspense } from "react";
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
import { HomeSectionPending } from "@/components/home/home-section-pending";

// Attach rejection handlers as soon as work starts, even if a boundary is only
// rendered later. One unavailable source must not discard unrelated sections.
async function load<T>(name: string, promise: Promise<T>): Promise<PromiseSettledResult<T>> {
  try { return { status: "fulfilled", value: await promise }; }
  catch (reason) {
    console.error(`[Home] ${name} unavailable`);
    return { status: "rejected", reason };
  }
}

type Result<T extends (...args: never[]) => unknown> = Promise<PromiseSettledResult<Awaited<ReturnType<T>>>>;

async function PetStories({ data }: { data: Result<typeof petsService.getPets> }) {
  const result = await data;
  const pets = (result.status === "fulfilled" ? result.value || [] : [])
    .map(normalizePetData)
    .map((pet) => ({ id: String(pet.id), name: pet.name, tag: pet.tag, image: pet.image }));
  return <DogsStoriesSection initialPets={pets} />;
}

async function ActiveCampaigns({ data }: { data: Result<typeof campaignsService.getCampaigns> }) {
  const result = await data;
  const campaigns = (result.status === "fulfilled" ? result.value.data || [] : []).map(normalizeCampaignData);
  return <CampaignsSection initialCampaigns={campaigns} />;
}

async function Donations({ data }: { data: Result<typeof donationsService.getRecentDonations> }) {
  const result = await data;
  const donationsRaw = result.status === "fulfilled" ? result.value : { status: "unavailable" as const };
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

  return <PaymentSection feed={donationFeed} />;
}

async function Wishlist({ items, settings }: {
  items: Result<typeof wishlistService.getItems>;
  settings: Result<typeof wishlistService.getSettings>;
}) {
  const [itemsResult, settingsResult] = await Promise.all([items, settings]);
  return <NeedsSection
    items={itemsResult.status === "fulfilled" ? itemsResult.value : []}
    settings={settingsResult.status === "fulfilled" ? settingsResult.value : { marketplaceName: "Ozon" }}
  />;
}

async function LatestNews({ data }: { data: Result<typeof newsService.getLatestNews> }) {
  const result = await data;
  return <NewsSection initialNews={result.status === "fulfilled" ? result.value : []} unavailable={result.status === "rejected"} />;
}

export default async function Home() {
  // Launch all requests together; only the intro's actual dependencies block it.
  // Retain ISR: do not force a cached homepage into per-request dynamic rendering.
  const news = load("news", newsService.getLatestNews(5));
  const pets = load("pets", petsService.getPets({ status: "shelter", limit: 5 }));
  const campaigns = load("campaigns", campaignsService.getCampaigns({ status: "active", limit: 3 }));
  const donations = load("donations", donationsService.getRecentDonations(20));
  const media = load("media", siteMediaService.getSiteMedia());
  const wishlist = load("wishlist", wishlistService.getItems());
  const settings = load("wishlist settings", wishlistService.getSettings());
  const statistics = load("statistics", petStatsService.getPetStats({ throwOnError: true }));
  const [mediaResult, statsResult] = await Promise.all([media, statistics]);
  const siteMedia = mediaResult.status === "fulfilled" ? mediaResult.value : {};
  const petStats = statsResult.status === "fulfilled" ? statsResult.value : EMPTY_PET_STATS;

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
          <Suspense fallback={<HomeSectionPending section="pets" />}>
            <PetStories data={pets} />
          </Suspense>
        </>
      }
      darkZoneTrigger={
        <Suspense fallback={<HomeSectionPending section="campaigns" />}>
          <ActiveCampaigns data={campaigns} />
        </Suspense>
      }
      darkZone={
        <>
          <Suspense fallback={<HomeSectionPending section="donate" />}>
            <Donations data={donations} />
          </Suspense>
          <Suspense fallback={<HomeSectionPending section="needs" />}>
            <Wishlist items={wishlist} settings={settings} />
          </Suspense>
          <VolunteerSection imageUrl={siteMedia.homeAbout} />
          <Suspense fallback={<HomeSectionPending section="news" />}>
            <LatestNews data={news} />
          </Suspense>
        </>
      }
    />
  );
}
