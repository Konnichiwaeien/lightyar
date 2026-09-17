import type { Metadata } from "next";

/** Set page-specific social metadata instead of inheriting the home page title. */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: path, siteName: "Светлый", locale: "ru_RU", type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "АНБО «Светлый»" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
  };
}
