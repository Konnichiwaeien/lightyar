import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { DogsStoriesSection } from "@/components/sections/dogs-stories-section";
import { CampaignsSection } from "@/components/sections/campaigns-section";
import { PaymentSection } from "@/components/sections/payment-section";
import { NeedsSection } from "@/components/sections/needs-section";
import { VolunteerSection } from "@/components/sections/volunteer-section";
import { NewsSection } from "@/components/sections/news-section";
import { HomeHeader } from "@/components/home/home-header";
import { ColorTransitionWrapper } from "@/components/home/color-transition-wrapper";
import { newsService } from "@/lib/api/services/news";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";

export default async function Home() {
  const news = await newsService.getLatestNews(5);
  
  // Fetch real pets looking for a home directly from the API
  const realPetsRaw = await petsService.getPets({ status: "shelter", limit: 5 }) || [];
  const petsInShelter = realPetsRaw
    .map(normalizePetData)
    .map((pet) => ({
      id: pet.id,
      name: pet.name,
      tag: pet.tag,
      image: pet.image
    }));

  // Fetch real active campaigns directly from Strapi
  const campaignsRaw = await campaignsService.getCampaigns({ status: "active", limit: 3 });
  const activeCampaigns = (campaignsRaw.data || []).map((camp) => {
    let imageUrl = "";
    if (camp.images && camp.images.length > 0) {
      imageUrl = campaignsService.resolveMediaUrl(camp.images[0].url);
    } else {
      const DEFAULT_CAMP_IMAGES = [
        "https://images.unsplash.com/photo-1544568100-847a9ec5d878?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
      ];
      imageUrl = DEFAULT_CAMP_IMAGES[camp.id % DEFAULT_CAMP_IMAGES.length];
    }

    return {
      id: camp.documentId,
      title: camp.title,
      desc: camp.shortDesc,
      current: Number(camp.current) || 0,
      total: Number(camp.total) || 100,
      image: imageUrl,
      tag: camp.tag || "Срочно",
      petName: camp.pet?.name || ""
    };
  });

  return (
    <ColorTransitionWrapper
      lightZone={
        <>
          <HomeHeader />
          <HeroSection />
          <AboutSection />
          <DogsStoriesSection initialPets={petsInShelter} />
        </>
      }
      darkZoneTrigger={
        <CampaignsSection initialCampaigns={activeCampaigns} />
      }
      darkZone={
        <>
          <PaymentSection />
          <NeedsSection />
          <VolunteerSection />
          <NewsSection initialNews={news} />
        </>
      }
    />
  );
}
