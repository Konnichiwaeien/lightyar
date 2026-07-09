import type { Metadata } from "next";
import { AboutNarrative } from "@/components/about/about-narrative";
import { HomeHeader } from "@/components/home/home-header";

export const metadata: Metadata = {
  title: "О нас | АНБО «Светлый» — Помощь бездомным животным Ярославль",
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
  openGraph: {
    title: "О нас | АНБО «Светлый» — Системная помощь животным",
    description: "Узнайте историю проекта, познакомьтесь с Мариной Морозовой, Светланой Клюкиной и Андреем Синицыным, и внесите свой вклад в помощь приюту.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function AboutPage() {
  return (
    <>
      <HomeHeader />
      <AboutNarrative />
    </>
  );
}

