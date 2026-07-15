import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReport } from "./normalize-report.ts";

test("normalization keeps zeroes, orders arrays, and removes documents without files", () => {
  const report = normalizeReport({
    id: 1,
    documentId: "report-2024",
    year: 2024,
    title: "Отчёт",
    summary: "Кратко",
    body: "Первый абзац\n\nВторой абзац",
    financialSummary: {
      currency: "RUB",
      income: "20509.71",
      targetExpenses: "0.00",
      bankFees: "60.75",
      closingBalance: "20448.96",
    },
    outcomes: [
      { id: 2, kind: "catsInCare", value: "25", qualifier: "exact", order: 20 },
      { id: 1, kind: "dogsInCare", value: "60", qualifier: "atLeast", order: 10 },
    ],
    customMetrics: [],
    documents: [
      {
        id: 2,
        title: "Без файла",
        documentType: "other",
        order: 5,
        file: null,
      },
      {
        id: 1,
        title: "Минюст",
        documentType: "ministryReport",
        order: 20,
        file: { id: 9, name: "report.docx", ext: ".docx", mime: "application/docx", size: 23.089, url: "/uploads/report.docx" },
      },
    ],
  }, (url) => `https://cms.example${url}`);

  assert.equal(report.financialSummary?.targetExpenses, 0);
  assert.deepEqual(report.outcomes.map((item) => item.kind), ["dogsInCare", "catsInCare"]);
  assert.equal(report.documents.length, 1);
  assert.equal(report.documents[0].url, "https://cms.example/uploads/report.docx");
  assert.equal(report.documents[0].format, "DOCX");
});

test("normalization leaves invalid or absent optional money unknown", () => {
  const report = normalizeReport({
    id: 1,
    documentId: "report-2025",
    year: 2025,
    title: "Отчёт",
    summary: "Кратко",
    financialSummary: { currency: "RUB", income: "unknown", closingBalance: null },
    outcomes: [],
    customMetrics: [],
    documents: [],
  }, (url) => url);

  assert.equal(report.financialSummary?.income, undefined);
  assert.equal(report.financialSummary?.closingBalance, undefined);
});
