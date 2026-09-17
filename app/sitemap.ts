import type { MetadataRoute } from "next";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { newsService } from "@/lib/api/services/news";
import { reportsService } from "@/lib/api/services/reports";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Dynamic routes
  const [petIdentifiers, campaigns, newsSlugs, reportYears] = await Promise.all([
    petsService.getAllPetIdentifiers().catch((err) => {
      console.error("[Sitemap] getAllPetIdentifiers failed:", err);
      return [];
    }),
    campaignsService.getAllCampaignIdentifiers().catch((err) => {
      console.error("[Sitemap] getAllCampaignIdentifiers failed:", err);
      return [];
    }),
    newsService.getAllNewsSlugs().catch((err) => {
      console.error("[Sitemap] getAllNewsSlugs failed:", err);
      return [];
    }),
    reportsService.getReportYears().catch((err) => {
      console.error("[Sitemap] getReportYears failed:", err);
      return [];
    }),
  ]);

  const petRoutes = (petIdentifiers || []).map((pet) => ({
    url: `${baseUrl}/pets/${pet.slug || pet.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const campaignRoutes = (campaigns || []).map((item) => ({
    url: `${baseUrl}/campaigns/${item.slug || item.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const newsRoutes = (newsSlugs || []).map((slug) => ({
    url: `${baseUrl}/news/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const reportRoutes = (reportYears || []).map((year) => ({
    url: `${baseUrl}/reports/${year}`,
    changeFrequency: "yearly" as const,
    priority: 0.65,
  }));

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/reports`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/campaigns`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pets`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...petRoutes, ...campaignRoutes, ...newsRoutes, ...reportRoutes];
}
