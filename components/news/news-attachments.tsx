import { ExternalLink, FileText, Headphones } from "lucide-react";

import type { NewsSupplementaryAttachment } from "@/lib/news/news-media";

interface NewsAttachmentsProps {
  items: NewsSupplementaryAttachment[];
}

export function NewsAttachments({ items }: NewsAttachmentsProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-3xl" aria-labelledby="news-attachments-title">
      <h2 id="news-attachments-title" className="mb-5 font-serif text-2xl text-[#1c1c1c]">
        Материалы к новости
      </h2>
      <ul className="grid gap-3" role="list">
        {items.map((item) => {
          const href = item.externalUrl || item.src;

          return (
            <li key={item.key} className="rounded-2xl border border-[#1c1c1c]/10 bg-white/70 p-5">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  {item.kind === "audio" ? (
                    <Headphones className="size-5" aria-hidden="true" />
                  ) : (
                    <FileText className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1c1c1c]">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm leading-relaxed text-[#1c1c1c]/65">
                      {item.description}
                    </p>
                  )}

                  {item.kind === "audio" && item.src && (
                    <audio
                      className="mt-4 w-full"
                      controls
                      preload="none"
                      aria-label={item.title}
                    >
                      <source src={item.src} type={item.mime} />
                      Ваш браузер не поддерживает аудио.
                    </audio>
                  )}

                  {item.transcript && (
                    <details className="mt-4 text-sm text-[#1c1c1c]/70">
                      <summary className="cursor-pointer font-semibold text-[#1c1c1c]">
                        Расшифровка
                      </summary>
                      <p className="mt-2 whitespace-pre-line leading-relaxed">
                        {item.transcript}
                      </p>
                    </details>
                  )}

                  {href && (item.kind === "file" || !item.src || item.externalUrl) && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 underline decoration-amber-400 underline-offset-4 transition-colors duration-300 hover:text-amber-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 motion-reduce:transition-none"
                    >
                      {item.kind === "file" ? "Открыть файл" : "Открыть источник"}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
