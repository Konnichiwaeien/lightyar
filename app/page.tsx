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

export default function Home() {
  return (
    <ColorTransitionWrapper
      lightZone={
        <>
          <HomeHeader />
          <HeroSection />
          <AboutSection />
          <DogsStoriesSection />
        </>
      }
      darkZoneTrigger={
        <CampaignsSection />
      }
      darkZone={
        <>
          <PaymentSection />
          <NeedsSection />
          <VolunteerSection />
          <NewsSection />
        </>
      }
    />
  );
}
