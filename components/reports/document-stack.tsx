import type { CSSProperties } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import type { ReportDocument } from "@/lib/reports/normalize-report";

const documentTypeLabels: Record<ReportDocument["documentType"], string> = {
  ministryReport: "Отчёт в Минюст",
  charityReport: "Благотворительная деятельность",
  financialStatement: "Финансовая отчётность",
  audit: "Аудиторское заключение",
  other: "Документ",
};

export function DocumentStack({ documents, year }: { documents: ReportDocument[]; year: number }) {
  if (documents.length === 0) return null;
  return (
    <section className="document-archive" aria-labelledby="documents-title">
      <div className="document-archive__heading">
        <div>
          <p className="reports-kicker">Исходные материалы</p>
          <h2 id="documents-title">Документы {year}</h2>
        </div>
        <p>{documents.length} {documents.length === 1 ? "проверяемый файл" : "проверяемых файла"}</p>
      </div>

      <ol className="document-stack">
        {documents.map((document, index) => (
          <li
            key={`${document.title}-${document.url}`}
            className="document-sheet"
            style={{ "--document-index": index } as CSSProperties}
          >
            <div className="document-sheet__topline">
              <span><FileText aria-hidden="true" size={17} /> {documentTypeLabels[document.documentType]}</span>
              <span>{document.format}{document.sizeLabel ? ` · ${document.sizeLabel}` : ""}</span>
            </div>
            <h3>{document.title}</h3>
            {document.note && <p>{document.note}</p>}
            <div className="document-sheet__actions">
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Открыть документ «${document.title}» в новой вкладке`}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
              >
                Открыть <ExternalLink aria-hidden="true" size={17} />
              </a>
              <a
                href={document.url}
                download
                aria-label={`Скачать документ «${document.title}»`}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
              >
                Скачать <Download aria-hidden="true" size={17} />
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
