import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Светлый — Луч надежды для животных",
  description: "АНБО «Светлый» — благотворительная организация помощи бездомным животным в Ярославле.",
};

import { MenuOverlay } from "@/components/layout/menu-overlay";
import { Footer } from "@/components/sections/footer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden">
        {children}
        <Footer />
        <MenuOverlay />
      </body>
    </html>
  );
}
