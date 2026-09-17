import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/site";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Светлый — Луч надежды для животных",
    template: "%s | Светлый",
  },
  description: "АНБО «Светлый» — благотворительная организация помощи бездомным животным в Ярославле. Помогите приюту: подарите дом питомцу или сделайте пожертвование.",
  keywords: ["приют для животных", "помощь бездомным животным", "Ярославль", "взять собаку из приюта", "взять кошку", "благотворительность"],
  openGraph: {
    title: "Светлый — Луч надежды для животных",
    description: "АНБО «Светлый» — благотворительная организация помощи бездомным животным в Ярославле. Возьмите питомца из приюта или помогите кормом.",
    url: SITE_URL,
    siteName: "Светлый",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "АНБО Светлый — Помощь животным в Ярославле",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Светлый — Луч надежды для животных",
    description: "АНБО «Светлый» — благотворительная организация помощи бездомным животным в Ярославле.",
    images: ["/og-image.jpg"],
  },
};

import { MenuOverlay } from "@/components/layout/menu-overlay";
import { Footer } from "@/components/sections/footer";
import { CursorProvider } from "@/components/ui/cursor-context";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" className="antialiased">
      <head>
        <link rel="preload" href="/fonts/ffe0837c71e69159-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/47f136985ef5b5cb-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen overflow-x-hidden">
        <CursorProvider>
          <SmoothScroll>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-6 focus:py-3 focus:rounded-full focus:shadow-lg focus:font-bold focus:uppercase focus:tracking-widest focus:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              Перейти к основному контенту
            </a>
            <CustomCursor />
            {children}
            <Footer />
            <MenuOverlay />
          </SmoothScroll>
        </CursorProvider>
      </body>
    </html>
  );
}
