import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { CampaignsControls } from "@/components/campaigns/campaigns-controls";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { ResilientImage } from "@/components/ui/resilient-image";
import { campaignsService } from "@/lib/api/services/campaigns";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";
import { firstAlive } from "@/lib/media/alive";
import "@/components/reports/reports.css";
import "@/components/campaigns/campaigns.css";

export const metadata: Metadata = {
  title: "Все сборы",
  description: "Открытые и закрытые сборы АНБО «Светлый»: на что собираем, сколько уже есть и сколько осталось.",
  alternates: { canonical: "/campaigns" },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ITEMS_PER_PAGE = 12;

/** Рубли без копеек: у сборов суммы круглые, копейки только шумят. */
const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/** Сортировка из адреса в запрос к CMS. Неизвестное значение не ломает страницу. */
const SORTS: Record<string, string> = {
  date_desc: "createdAt:desc",
  date_asc: "createdAt:asc",
  collected_desc: "current:desc",
  collected_asc: "current:asc",
};

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const status = resolved.status === "closed" ? "closed" : "active";
  const sort = typeof resolved.sort === "string" ? resolved.sort : "date_desc";
  const parsedPage = typeof resolved.page === "string" ? Number.parseInt(resolved.page, 10) : 1;
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  const campaignsData = await campaignsService.getCampaigns({
    status,
    sort: SORTS[sort] ?? SORTS.date_desc,
    limit: ITEMS_PER_PAGE,
    start: (page - 1) * ITEMS_PER_PAGE,
  });

  // Обложки сборов переживают свои файлы: запись в CMS есть, объекта в
  // бакете нет. Спрашиваем хранилище и при пропаже ставим портрет подопечного.
  const list = await Promise.all(
    (campaignsData.data || []).map(normalizeCampaignData).map(async (fund) => ({
      ...fund,
      image: (await firstAlive([fund.image, fund.petImage])) ?? "/photo-placeholder.jpg",
    })),
  );
  const total = campaignsData.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));

  // Сводка считается по показанной странице: это честно, потому что других
  // сумм у нас на руках нет, и подпись говорит ровно это.
  const collected = list.reduce((sum, item) => sum + item.current, 0);
  const goal = list.reduce((sum, item) => sum + item.total, 0);
  const openNow = list.filter((item) => item.status === "active").length;

  return (
    <div className="surface">
      <InnerHeader />
      <main id="main-content">
        <section className="camp-head">
          <div className="reports-wrap">
            <h1>
              Все <span className="reports-mark">сборы</span>
            </h1>
            <p className="camp-lead">
              {total > 0 ? (
                <>
                  Сейчас в работе <strong>{total}</strong> {plural(total, "сбор", "сбора", "сборов")}. Каждый закрывает
                  конкретную нужду приюта: корм, лечение, тёплые вольеры. Видно, сколько уже собрано и сколько осталось.
                </>
              ) : (
                <>Здесь появятся сборы на корм, лечение и содержание приюта. Сейчас открытых сборов нет.</>
              )}
            </p>

            {list.length > 0 ? (
              <ul className="camp-totals">
                <li data-tone="amber">
                  <b className="reports-num">{money(collected)}</b>
                  <span>уже собрано на этой странице</span>
                </li>
                <li>
                  <b className="reports-num">{money(Math.max(0, goal - collected))}</b>
                  <span>осталось до цели</span>
                </li>
                <li>
                  <b className="reports-num">{openNow}</b>
                  <span>{plural(openNow, "сбор идёт", "сбора идут", "сборов идут")}</span>
                </li>
              </ul>
            ) : null}
          </div>
        </section>

        <section className="camp-list" aria-label="Список сборов">
          <div className="reports-wrap">
            <Suspense fallback={null}>
              <CampaignsControls />
            </Suspense>

            {list.length > 0 ? (
              <ul className="camp-grid">
                {list.map((fund, index) => {
                  const share = fund.total > 0 ? Math.min(1, fund.current / fund.total) : 0;
                  const left = Math.max(0, fund.total - fund.current);

                  return (
                    <li key={fund.id}>
                      <Link
                        className="camp"
                        href={`/campaigns/${fund.id}`}
                        data-status={fund.status}
                        style={{ "--i": index } as React.CSSProperties}
                      >
                        <span className="camp-shot">
                          <span className="camp-tag">{fund.tag}</span>
                          <ResilientImage
                            src={fund.image}
                            alt=""
                            fill
                            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                            className="object-cover"
                            fallbackLabel="Обложка сбора появится позже"
                          />
                        </span>

                        <span className="camp-body">
                          {fund.petName ? <span className="camp-pet">Сбор для {fund.petName}</span> : null}
                          <h2>{fund.title}</h2>
                          {fund.desc ? <p className="camp-desc">{fund.desc}</p> : null}

                          <span className="camp-money">
                            <b className="reports-num">{money(fund.current)}</b>
                            <span className="reports-num">из {money(fund.total)}</span>
                          </span>

                          <span
                            className="camp-bar"
                            role="progressbar"
                            aria-valuenow={fund.current}
                            aria-valuemin={0}
                            aria-valuemax={fund.total}
                            aria-label={`Собрано ${fund.current} рублей из ${fund.total}`}
                          >
                            <i style={{ "--fill": `${share * 100}%` } as React.CSSProperties} />
                          </span>

                          <span className="camp-state">
                            {fund.status === "active"
                              ? left > 0
                                ? `Осталось ${money(left)}`
                                : "Цель собрана"
                              : "Сбор закрыт"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="camp-empty">
                {status === "closed"
                  ? "Закрытых сборов пока нет. Посмотрите те, что идут сейчас."
                  : "Открытых сборов сейчас нет. Помочь приюту можно на главной странице."}
              </p>
            )}

            <Suspense fallback={null}>
              <CampaignsPagination currentPage={safePage} totalPages={totalPages} />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
