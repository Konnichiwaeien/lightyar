import type {
  StrapiAnnualReport,
  StrapiCustomMetric,
  StrapiFinancialSummary,
  StrapiOutcomeMetric,
  StrapiReportDocument,
  StrapiTrustNote,
} from "../api/types";
import {
  parseOptionalNumber,
  sortByOrder,
  sortReportsNewestFirst,
  type Qualifier,
} from "./report-domain.ts";

export type OutcomeKind = StrapiOutcomeMetric["kind"];
export type DocumentType = StrapiReportDocument["documentType"];

/**
 * Карточка доверия: короткое утверждение о фонде, которое нельзя посчитать
 * из отчёта. Откуда деньги, кто в команде. Раньше это был текст в разметке
 * страницы, и правился он только кодом.
 */
export interface TrustNote {
  title: string;
  text: string;
  /** Кусок текста, который выделяется янтарём. Должен встречаться в тексте. */
  highlight?: string;
}

export interface FinancialSummary {
  currency: "RUB";
  income?: number;
  targetExpenses?: number;
  operatingExpenses?: number;
  bankFees?: number;
  closingBalance?: number;
  note?: string;
}

export interface ReportOutcome {
  id?: number;
  kind: OutcomeKind;
  value: number;
  qualifier: Qualifier;
  note?: string;
  order: number;
}

export interface ReportCustomMetric {
  id?: number;
  label: string;
  value: number;
  qualifier: Qualifier;
  unit?: string;
  note?: string;
  order: number;
}

export interface ReportDocument {
  id?: number;
  title: string;
  documentType: DocumentType;
  url: string;
  format: string;
  sizeLabel?: string;
  note?: string;
  order: number;
}

export interface AnnualReport {
  id: number;
  documentId: string;
  year: number;
  title: string;
  summary: string;
  body?: string;
  coverImage?: string;
  financialSummary?: FinancialSummary;
  fundingNote?: TrustNote;
  teamNote?: TrustNote;
  outcomes: ReportOutcome[];
  customMetrics: ReportCustomMetric[];
  documents: ReportDocument[];
  updatedAt?: string;
}

function normalizeFinancialSummary(summary?: StrapiFinancialSummary | null): FinancialSummary | undefined {
  if (!summary) return undefined;
  return {
    currency: summary.currency || "RUB",
    income: parseOptionalNumber(summary.income),
    targetExpenses: parseOptionalNumber(summary.targetExpenses),
    operatingExpenses: parseOptionalNumber(summary.operatingExpenses),
    bankFees: parseOptionalNumber(summary.bankFees),
    closingBalance: parseOptionalNumber(summary.closingBalance),
    note: summary.note?.trim() || undefined,
  };
}

function normalizeOutcome(metric: StrapiOutcomeMetric): ReportOutcome | null {
  const value = parseOptionalNumber(metric.value);
  if (value === undefined) return null;
  return {
    id: metric.id,
    kind: metric.kind,
    value,
    qualifier: metric.qualifier,
    note: metric.note?.trim() || undefined,
    order: metric.order ?? 0,
  };
}

function normalizeCustomMetric(metric: StrapiCustomMetric): ReportCustomMetric | null {
  const value = parseOptionalNumber(metric.value);
  if (value === undefined) return null;
  return {
    id: metric.id,
    label: metric.label,
    value,
    qualifier: metric.qualifier,
    unit: metric.unit?.trim() || undefined,
    note: metric.note?.trim() || undefined,
    order: metric.order ?? 0,
  };
}

function formatFileSize(size: unknown): string | undefined {
  const kilobytes = parseOptionalNumber(size);
  if (kilobytes === undefined) return undefined;
  if (kilobytes >= 1024) {
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(kilobytes / 1024)} МБ`;
  }
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(kilobytes)} КБ`;
}

function fileFormat(name: string, extension?: string | null): string {
  const ext = extension || name.match(/\.[^.]+$/)?.[0] || "";
  return ext.replace(/^\./, "").toUpperCase() || "ФАЙЛ";
}

function normalizeDocument(
  document: StrapiReportDocument,
  resolveMediaUrl: (url: string) => string,
): ReportDocument | null {
  if (!document.file?.url) return null;
  return {
    id: document.id,
    title: document.title,
    documentType: document.documentType,
    url: resolveMediaUrl(document.file.url),
    format: fileFormat(document.file.name, document.file.ext),
    sizeLabel: formatFileSize(document.file.size),
    note: document.note?.trim() || undefined,
    order: document.order ?? 0,
  };
}

function normalizeTrustNote(note?: StrapiTrustNote | null): TrustNote | undefined {
  const title = note?.title?.trim();
  const text = note?.text?.trim();
  if (!title || !text) return undefined;
  const highlight = note?.highlight?.trim();
  return { title, text, highlight: highlight && text.includes(highlight) ? highlight : undefined };
}

export function normalizeReport(
  report: StrapiAnnualReport,
  resolveMediaUrl: (url: string) => string,
): AnnualReport {
  return {
    id: report.id,
    documentId: report.documentId,
    year: report.year,
    title: report.title,
    summary: report.summary,
    body: report.body?.trim() || undefined,
    coverImage: report.coverImage?.url ? resolveMediaUrl(report.coverImage.url) : undefined,
    financialSummary: normalizeFinancialSummary(report.financialSummary),
    fundingNote: normalizeTrustNote(report.fundingNote),
    teamNote: normalizeTrustNote(report.teamNote),
    outcomes: sortByOrder((report.outcomes || []).map(normalizeOutcome).filter((item): item is ReportOutcome => item !== null)),
    customMetrics: sortByOrder((report.customMetrics || []).map(normalizeCustomMetric).filter((item): item is ReportCustomMetric => item !== null)),
    documents: sortByOrder((report.documents || []).map((item) => normalizeDocument(item, resolveMediaUrl)).filter((item): item is ReportDocument => item !== null)),
    updatedAt: report.updatedAt,
  };
}

export function normalizeReports(
  reports: StrapiAnnualReport[],
  resolveMediaUrl: (url: string) => string,
): AnnualReport[] {
  return sortReportsNewestFirst(reports.map((report) => normalizeReport(report, resolveMediaUrl)));
}
