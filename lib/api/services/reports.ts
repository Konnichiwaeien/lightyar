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

/** Ровно наш код ответа, а не число, случайно попавшее в адрес запроса. */
const SCHEMA_TOO_OLD = /Strapi API Error: 400/;

/**
 * Схема без новых полей: узнаём об этом один раз и дальше не спрашиваем.
 * Иначе каждый показ страницы стоил бы лишнего отказа и записи в журнал.
 */
let freshFields = true;

export class ReportsService extends StrapiClient {
  /** Запрос со свежими полями, а если схема их ещё не знает, то без них. */
  private async fetchReports(query: (populate: string) => string) {
    const ask = (populate: string) =>
      this.fetchJson<StrapiResponseCollection<StrapiAnnualReport>>(query(populate), { next: { revalidate: 60 } });

    if (!freshFields) return ask(LEGACY_POPULATE);

    try {
      return await ask(REPORT_POPULATE);
    } catch (error) {
      if (!(error instanceof Error) || !SCHEMA_TOO_OLD.test(error.message)) throw error;
      freshFields = false;
      console.warn("[ReportsService] Схема CMS без карточек доверия, дальше спрашиваю без них.");
      return ask(LEGACY_POPULATE);
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
