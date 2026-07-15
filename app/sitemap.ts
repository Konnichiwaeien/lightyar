import type { MetadataRoute } from "next";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { newsService } from "@/lib/api/services/news";
import { reportsService } from "@/lib/api/services/reports";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lightyar.shdk.tech";

  // Dynamic routes
  const [petIds, campaigns, newsSlugs, reportYears] = await Promise.all([
    petsService.getAllPetIds().catch((err) => {
      console.error("[Sitemap] getAllPetIds failed:", err);
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

  const petRoutes = (petIds || []).map((id) => ({
    url: `${baseUrl}/pets/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const campaignRoutes = (campaigns || []).map((item) => ({
    url: `${baseUrl}/campaigns/${item.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const newsRoutes = (newsSlugs || []).map((slug) => ({
    url: `${baseUrl}/news/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const reportRoutes = (reportYears || []).map((year) => ({
    url: `${baseUrl}/reports/${year}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.65,
  }));

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/reports`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/campaigns`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pets`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...petRoutes, ...campaignRoutes, ...newsRoutes, ...reportRoutes];
}
