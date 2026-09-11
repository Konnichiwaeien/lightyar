import { StrapiClient } from "../client";
import type { StrapiAnnualReport, StrapiResponseCollection } from "../types";
import {
  normalizeReport,
  normalizeReports,
  type AnnualReport,
} from "../../reports/normalize-report";

const BASE_POPULATE = [
  "populate[coverImage]=true",
  "populate[financialSummary]=true",
  "populate[outcomes]=true",
  "populate[customMetrics]=true",
  "populate[documents][populate][file]=true",
];

/**
 * Поля, которые появились в схеме позже фронтенда. Strapi отвечает 400 на
 * populate несуществующего поля, поэтому запрос с ними идёт первым, а при
 * отказе повторяется без них: страница переживает выкладку в любом порядке.
 */
const FRESH_POPULATE = ["populate[fundingNote]=true", "populate[teamNote]=true"];

const REPORT_POPULATE = [...BASE_POPULATE, ...FRESH_POPULATE].join("&");
const LEGACY_POPULATE = BASE_POPULATE.join("&");

export class ReportsService extends StrapiClient {
  /** Запрос со свежими полями, а если схема их ещё не знает, то без них. */
  private async fetchReports(query: (populate: string) => string) {
    try {
      return await this.fetchJson<StrapiResponseCollection<StrapiAnnualReport>>(query(REPORT_POPULATE), {
        next: { revalidate: 60 },
      });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("400")) throw error;
      console.warn("[ReportsService] Схема CMS без карточек доверия, повторяю запрос без них.");
      return await this.fetchJson<StrapiResponseCollection<StrapiAnnualReport>>(query(LEGACY_POPULATE), {
        next: { revalidate: 60 },
      });
    }
  }

  async getReports(): Promise<AnnualReport[]> {
    const response = await this.fetchReports(
      (populate) => `/annual-reports?status=published&${populate}&sort[0]=year:desc&pagination[limit]=100`,
    );
    return normalizeReports(response.data || [], (url) => this.resolveMediaUrl(url));
  }

  async getReportByYear(year: number): Promise<AnnualReport | null> {
    const response = await this.fetchReports(
      (populate) =>
        `/annual-reports?status=published&filters[year][$eq]=${encodeURIComponent(year)}&${populate}&pagination[limit]=1`,
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
