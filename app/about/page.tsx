import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { AboutNarrative } from "@/components/about/about-narrative";
import { HomeHeader } from "@/components/home/home-header";
import { aboutPageService } from "@/lib/api/services/about-page";

export const metadata: Metadata = {
  ...pageMetadata("О нас", "Миссия, история развития и команда благотворительной организации АНБО «Светлый». Узнайте, как стать волонтером, выгуливать собак или помочь приюту в Ярославле и Рыбинске.", "/about"),
  title: "О нас",
  description: "Миссия, история развития и команда благотворительной организации АНБО «Светлый». Узнайте, как стать волонтером, выгуливать собак или помочь приюту в Ярославле и Рыбинске.",
  keywords: [
    "приют для собак",
    "помощь животным ярославль",
    "благотворительный фонд",
    "волонтеры",
    "анбо светлый",
    "взять собаку из приюта",
    "рыбинск",
    "ярославская область"
  ],
};

export default async function AboutPage() {
  const content = await aboutPageService.getAboutPage();

  return (
    <div className="min-h-screen bg-[#e8e4dc] text-[#111110]">
      <HomeHeader />
      <main id="main-content">
        <AboutNarrative content={content} />
      </main>
    </div>
  );
}
