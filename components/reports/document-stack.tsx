import type { ReactNode } from "react";
import { Download, FileText } from "lucide-react";
import type { ReportDocument } from "@/lib/reports/normalize-report";

const TYPE_LABEL: Record<ReportDocument["documentType"], string> = {
  ministryReport: "Отчёт в Минюст",
  charityReport: "Отчёт о благотворительной деятельности",
  financialStatement: "Бухгалтерская отчётность",
  audit: "Аудиторское заключение",
  other: "Документ",
};

/**
 * Исходные документы отчёта. Каждая строка это прямая ссылка на файл:
 * без файла запись до сюда не доходит, её отсеивает нормализатор.
 */
export function DocumentStack({
  documents,
  heading,
}: {
  documents: ReportDocument[];
  heading: ReactNode;
}) {
  if (documents.length === 0) return null;

  return (
    <section className="reports-docs" id="dokumenty">
      <div className="reports-wrap">
        <h2>{heading}</h2>
        {/* Строкой, а не листом: у отчёта нет обложки, и белый прямоугольник
            с иконкой посередине оставался пустым на пол-экрана. */}
        <ul className="reports-doc-list">
          {documents.map((document) => (
            <li key={`${document.title}-${document.order}`}>
              <a className="reports-doc" href={document.url} download>
                <span className="reports-doc-badge" aria-hidden="true">
                  <FileText className="reports-pic" />
                </span>
                <span className="reports-doc-body">
                  <b>{document.title}</b>
                  <small>
                    {document.format}
                    {document.sizeLabel ? ` · ${document.sizeLabel}` : ""} · {TYPE_LABEL[document.documentType]}
                  </small>
                  {document.note ? <small className="reports-doc-note">{document.note}</small> : null}
                </span>
                <span className="reports-doc-action">
                  Скачать
                  <Download className="reports-pic" aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
