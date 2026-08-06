import { FileText } from "lucide-react";
import type { ReportDocument } from "@/lib/reports/normalize-report";

const TYPE_LABEL: Record<ReportDocument["documentType"], string> = {
  ministryReport: "Отчёт в Минюст",
  charityReport: "Отчёт о благотворительной деятельности",
  financialStatement: "Бухгалтерская отчётность",
  audit: "Аудиторское заключение",
  other: "Документ",
};

/**
 * Исходные документы отчёта. Каждый лист — прямая ссылка на файл:
 * без файла запись до сюда не доходит, её отсеивает нормализатор.
 */
export function DocumentStack({ documents, heading }: { documents: ReportDocument[]; heading: string }) {
  if (documents.length === 0) return null;

  return (
    <section className="reports-docs" id="dokumenty">
      <div className="reports-wrap">
        <h2>{heading}</h2>
        <ul className="reports-doc-grid">
          {documents.map((document) => (
            <li key={`${document.title}-${document.order}`}>
              <a className="reports-doc" href={document.url} download>
                <div className="reports-doc-sheet">
                  <FileText className="reports-pic" aria-hidden="true" />
                </div>
                <div>
                  <b>{document.title}</b>
                  <small>
                    {document.format}
                    {document.sizeLabel ? ` · ${document.sizeLabel}` : ""} · {TYPE_LABEL[document.documentType]}
                  </small>
                  {document.note ? <small>{document.note}</small> : null}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
