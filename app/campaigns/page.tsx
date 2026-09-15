import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { CampaignsControls } from "@/components/campaigns/campaigns-controls";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import { CampaignHelpButton } from "@/components/campaigns/campaign-help-button";
import { CampaignCover } from "@/components/campaigns/campaign-cover";
import { CampaignRoute } from "@/components/campaigns/campaign-route";
import { CampaignCall } from "@/components/campaigns/campaign-call";
import { InnerHeader } from "@/components/layout/inner-header";
import { campaignsService } from "@/lib/api/services/campaigns";
import { resolveCovers } from "@/lib/campaigns/cover";
import { needArt } from "@/lib/campaigns/collage";
import { PLEDGE, getCampaignSummary } from "@/lib/campaigns/summary";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";
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

export default async function CampaignsPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const status = resolved.status === "closed" ? "closed" : "active";
  const sort = typeof resolved.sort === "string" ? resolved.sort : "date_desc";
  const parsedPage = typeof resolved.page === "string" ? Number.parseInt(resolved.page, 10) : 1;
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  /* Обложка считается по всем открытым сборам, а список по фильтру из адреса.
     Запросы идут разом: последовательно они выстроились бы в лесенку и
     задержали бы первый байт на время лишнего обхода CMS. */
  const [campaignsData, summary] = await Promise.all([
    campaignsService.getCampaigns({
      status,
      sort: SORTS[sort] ?? SORTS.date_desc,
      limit: ITEMS_PER_PAGE,
      start: (page - 1) * ITEMS_PER_PAGE,
    }),
    getCampaignSummary(),
  ]);

  const list = await resolveCovers((campaignsData.data || []).map(normalizeCampaignData));
  const total = campaignsData.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));

  return (
    <div className="camp">
      <InnerHeader />
      <main id="main-content">
        {/* Обложка «Сквозь вещи»: секция 1 плана. Разбор в самом компоненте.
            Открытых сборов нет, значит и показывать нечего: страница уходит
            сразу в список с пустым состоянием. */}
        {summary ? (
          <CampaignCover summary={summary} />
        ) : (
          <div className="camp-inner">
            <section className="camp-cover camp-cover--empty">
              <div className="camp-cover__copy">
                <p className="camp-kicker">Чем помочь прямо сейчас</p>
                <h1>
                  Открытые
                  <em>сборы</em>
                </h1>
                <p className="camp-cover__lead">
                  Здесь появятся сборы на корм, лечение и содержание приюта. Открытых сборов сейчас нет.
                </p>
              </div>
            </section>
          </div>
        )}

        <div className="camp-inner">
          <Suspense fallback={null}>
            <CampaignsControls />
          </Suspense>

          {list.length > 0 ? (
            <ul className="camp-grid">
              {list.map((fund, index) => {
                const share = fund.total > 0 ? Math.min(1, fund.current / fund.total) : 0;
                const rest = Math.max(0, fund.total - fund.current);

                return (
                  <li key={fund.id}>
                    <article
                      className="camp-card"
                      data-status={fund.status}
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      <div className="camp-card__media">
                        {fund.shot.src ? (
                          <Image
                            src={fund.shot.src}
                            alt=""
                            width={640}
                            height={480}
                            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                          />
                        ) : null}
                        <span className="camp-tag">{fund.tag}</span>
                        {fund.shot.borrowed ? <span className="camp-borrowed">кадр из жизни приюта</span> : null}
                      </div>

                      <div className="camp-card__content">
                        <div className="camp-card__title">
                          <b>
                            <Link href={`/campaigns/${fund.id}`}>{fund.title}</Link>
                          </b>
                          {fund.petName ? <span className="camp-pet-name">{fund.petName}</span> : null}
                        </div>
                        <p className="camp-specs">{fund.desc}</p>

                        <div
                          className="camp-bar"
                          role="progressbar"
                          aria-valuenow={fund.current}
                          aria-valuemin={0}
                          aria-valuemax={fund.total}
                          aria-label={`Собрано ${fund.current} рублей из ${fund.total}`}
                        >
                          <i style={{ "--fill": `${share * 100}%` } as React.CSSProperties} />
                        </div>

                        <p className="camp-money">
                          <b>{money(fund.current)}</b>
                          <span>
                            {fund.status === "closed"
                              ? `цель ${money(fund.total)}`
                              : rest > 0
                                ? `осталось ${money(rest)}`
                                : "цель собрана"}
                          </span>
                        </p>
                      </div>

                      <div className="camp-card__actions">
                        {fund.status === "active" ? (
                          <CampaignHelpButton id={fund.id} title={fund.title} />
                        ) : (
                          <span className="camp-closed">
                            <CheckCircle2 size={17} aria-hidden="true" /> Сбор закрыт
                          </span>
                        )}
                        <Link className="camp-btn camp-btn--quiet" href={`/campaigns/${fund.id}`}>
                          Подробнее о сборе
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
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

        {/* Лента «Куда уходит взнос»: секция 3 плана. Стоит после карточек
            намеренно, это блок доверия: он работает, когда читатель уже
            посмотрел сборы. Станции без своих сборов подписи не получают. */}
        {summary && summary.stations.length > 0 ? (
          <CampaignRoute
            stations={summary.stations.map((station) => ({ ...station, art: needArt(station.tag) }))}
            unit={PLEDGE}
          />
        ) : null}

        {/* Финальный призыв: секция 5 плана. Заменила янтарную карточку
            «Просто помочь», которая стояла последней в сетке и говорила
            ровно это же. */}
        <CampaignCall />
      </main>
    </div>
  );
}
