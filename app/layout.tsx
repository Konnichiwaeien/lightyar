import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Светлый — Луч надежды для животных",
  description: "АНБО «Светлый» — благотворительная организация помощи бездомным животным в Ярославле.",
};

import { MenuOverlay } from "@/components/layout/menu-overlay";
import { Footer } from "@/components/sections/footer";
import { CursorProvider } from "@/components/ui/cursor-context";
import { CustomCursor } from "@/components/ui/custom-cursor";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden">
        <CursorProvider>
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
        </CursorProvider>
      </body>
    </html>
  );
}
