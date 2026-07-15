import { StrapiClient } from "../client";
import type { StrapiAnnualReport, StrapiResponseCollection } from "../types";
import {
  normalizeReport,
  normalizeReports,
  type AnnualReport,
} from "../../reports/normalize-report";

const REPORT_POPULATE = [
  "populate[coverImage]=true",
  "populate[financialSummary]=true",
  "populate[outcomes]=true",
  "populate[customMetrics]=true",
  "populate[documents][populate][file]=true",
].join("&");

export class ReportsService extends StrapiClient {
  async getReports(): Promise<AnnualReport[]> {
    const response = await this.fetchJson<StrapiResponseCollection<StrapiAnnualReport>>(
      `/annual-reports?status=published&${REPORT_POPULATE}&sort[0]=year:desc&pagination[limit]=100`,
      { next: { revalidate: 60 } },
    );
    return normalizeReports(response.data || [], (url) => this.resolveMediaUrl(url));
  }

  async getReportByYear(year: number): Promise<AnnualReport | null> {
    const response = await this.fetchJson<StrapiResponseCollection<StrapiAnnualReport>>(
      `/annual-reports?status=published&filters[year][$eq]=${encodeURIComponent(year)}&${REPORT_POPULATE}&pagination[limit]=1`,
      { next: { revalidate: 60 } },
    );
    const report = response.data?.[0];
    return report ? normalizeReport(report, (url) => this.resolveMediaUrl(url)) : null;
  }

  async getReportYears(): Promise<number[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<Pick<StrapiAnnualReport, "year">>>(
        "/annual-reports?status=published&fields[0]=year&sort[0]=year:desc&pagination[limit]=100",
        { next: { revalidate: 3600 } },
      );
      return (response.data || []).map((report) => report.year);
    } catch (error) {
      console.error("[ReportsService] getReportYears failed:", error);
      return [];
    }
  }
}

export const reportsService = new ReportsService();
export default reportsService;
