import { Suspense } from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PackageOpen, Sparkles } from "lucide-react";

import { CampaignsControls } from "@/components/campaigns/campaigns-controls";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignCover } from "@/components/campaigns/campaign-cover";
import { CampaignRoute } from "@/components/campaigns/campaign-route";
import { CampaignCall } from "@/components/campaigns/campaign-call";
import { CampaignDonateDialog } from "@/components/campaigns/campaign-donate-dialog";
import { CampaignBlankDonate } from "@/components/campaigns/campaign-blank-donate";
import { InnerHeader } from "@/components/layout/inner-header";
import { campaignsService } from "@/lib/api/services/campaigns";
import { resolveCovers } from "@/lib/campaigns/cover";
import { needArt } from "@/lib/campaigns/collage";
import { getCampaignSummary } from "@/lib/campaigns/summary";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";
import { plural } from "@/lib/reports/shelter-scales";
import { siteUrl } from "@/lib/seo/site";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { campaignCatalogState } from "@/lib/campaigns/catalog-state";
import "@/components/campaigns/campaigns.css";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const state = campaignCatalogState(await searchParams);
  const title = `${state.status === "closed" ? "Завершённые сборы" : "Все сборы"}${state.page > 1 ? ` — страница ${state.page}` : ""}`;
  return {
    ...pageMetadata(title, "Открытые и закрытые сборы АНБО «Светлый»: на что собираем, сколько уже есть и сколько осталось.", state.canonical),
    robots: { index: !state.noindex, follow: true },
  };
}

/**
 * Страница собирается на сервере при каждом запросе: фильтр, сортировка и
 * номер страницы живут в адресе, и по ним каждый раз своя выборка. Данные
 * при этом кэшируются на минуту в самих запросах к CMS
 * (`next: { revalidate: 60 }` в сервисах), поэтому частые заходы не будят
 * Strapi заново. В браузере ничего не дозагружается: список, суммы и кадры
 * приходят готовыми в разметке.
 */
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/* Две полосы по четыре на рабочем столе. Дальше постраничность: каталог
   растёт, а страница не должна расти вместе с ним. */
const ITEMS_PER_PAGE = 8;

/** Сортировка из адреса в запрос к CMS. Неизвестное значение не ломает страницу. */
const SORTS: Record<string, string> = {
  date_desc: "createdAt:desc",
  date_asc: "createdAt:asc",
  collected_desc: "current:desc",
  collected_asc: "current:asc",
};

/* Вырезки обложки: самая крупная из них и есть LCP страницы. Обложка
   клиентская, её картинки уходят в загрузку после гидратации, и замер давал
   2,3 секунды. Предзагрузка ставит их в очередь сразу с разметкой. */
const COVER_ART = [
  "/campaigns/people/care.webp",
  "/pets/cutout-kapral.webp",
  "/campaigns/people/walk.webp",
];

export default async function CampaignsPage({ searchParams }: PageProps) {
  for (const src of COVER_ART) ReactDOM.preload(src, { as: "image", fetchPriority: "high" });

  const resolved = await searchParams;
  const { status, sort, page } = campaignCatalogState(resolved);

  /* Обложка считается по всем открытым сборам, список по фильтру из адреса,
     а число закрытых нужно вкладке фильтра. Запросы идут разом:
     последовательно они выстроились бы в лесенку и задержали бы первый байт
     на время лишнего обхода CMS. */
  const [campaignsData, summary, closedData] = await Promise.all([
    campaignsService.getCampaigns({
      status,
      sort: SORTS[sort] ?? SORTS.date_desc,
      limit: ITEMS_PER_PAGE,
      start: (page - 1) * ITEMS_PER_PAGE,
    }),
    getCampaignSummary(),
    campaignsService.getCampaigns({ status: "closed", limit: 1 }),
  ]);

  const list = await resolveCovers((campaignsData.data || []).map(normalizeCampaignData));
  const total = campaignsData.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (page > Math.max(1, totalPages)) notFound();
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const counts = { active: summary?.funds ?? 0, closed: closedData.meta?.pagination?.total || 0 };

  /* Разметка списка для поисковика: сборы страницы с их адресами и суммами.
     Страница сбора отдаёт свои хлебные крошки, здесь список того, что на ней
     видно. Суммы берутся те же, что показаны читателю. */
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Сборы АНБО «Светлый»",
    numberOfItems: list.length,
    itemListElement: list.map((fund, index) => ({
      "@type": "ListItem",
      position: (safePage - 1) * ITEMS_PER_PAGE + index + 1,
      url: siteUrl(`/campaigns/${fund.slug || fund.id}`),
      name: fund.title,
    })),
  };

  return (
    <div className="camp">
      <InnerHeader />
      <main id="main-content">
        {/* Обложка-коллаж: секция 1 плана. Разбор в самом компоненте.
            Открытых сборов нет, значит и показывать нечего: страница уходит
            сразу в каталог с пустым состоянием. */}
        {summary ? (
          <CampaignCover summary={summary} />
        ) : (
          <section className="camp-cover camp-cover--empty">
            <div className="camp-inner camp-cover__copy">
              <h1>
                Все <em>сборы</em>
              </h1>
              <p className="camp-cover__lead">
                Здесь появятся сборы на корм, лечение и содержание приюта. Открытых сборов сейчас нет.
              </p>
            </div>
          </section>
        )}

        {/* Каталог: секция 2 плана. Верхний отступ держит место под лапы
            вырезок, которые выходят с обложки через шов: фильтр стоит ниже
            их, и ни одна кнопка не оказывается под собакой. */}
        <section aria-labelledby="camp-list-title" className="camp-list" id="camp-list">
          <div className="camp-inner">
            <header className="camp-list__head">
              <div className="camp-list__title">
                <h2 id="camp-list-title">
                  {total} {plural(total, "сбор", "сбора", "сборов")}{" "}
                  <em>
                    {status === "closed"
                      ? plural(total, "закрыт", "закрыты", "закрыто")
                      : plural(total, "идёт сейчас", "идут сейчас", "идут сейчас")}
                  </em>
                </h2>
              </div>
              <Suspense fallback={null}>
                <CampaignsControls counts={counts} />
              </Suspense>
            </header>

            {list.length > 0 ? (
              <ul className="camp-grid">
                {list.map((fund, index) => (
                  <CampaignCard fund={fund} index={index} key={fund.id} />
                ))}
              </ul>
            ) : (
              /* Пустое состояние это карточка, а не строка текста: строка
                 посреди пустого листа читается сбоем загрузки. Отсюда же
                 ведёт выход: к открытым сборам или к взносу без цели. */
              <div className="camp-blank">
                <span aria-hidden="true" className="camp-blank__badge">
                  {status === "closed" ? <CheckCircle2 size={30} /> : <PackageOpen size={30} />}
                </span>
                <h3>{status === "closed" ? "Закрытых сборов пока нет" : "Открытых сборов сейчас нет"}</h3>
                <p>
                  {status === "closed"
                    ? "Как только сбор закроется, он останется здесь: с итоговой суммой и историей, на что ушли деньги."
                    : "Приют собирает на нужды по мере их появления. Пока новых сборов нет, помочь можно взносом без цели."}
                </p>
                {status === "closed" ? (
                  <Link className="camp-btn camp-blank__cta" href="/campaigns?status=active">
                    <Sparkles aria-hidden="true" size={17} />
                    Посмотреть, что идёт сейчас
                  </Link>
                ) : (
                  <CampaignBlankDonate />
                )}
              </div>
            )}

            <Suspense fallback={null}>
              <CampaignsPagination currentPage={safePage} totalPages={totalPages} />
            </Suspense>
          </div>
        </section>

        {/* «На что идут ваши деньги»: секция 3 плана, закреплённая сцена.
            Стоит после каталога намеренно, это блок доверия: он работает,
            когда читатель уже посмотрел сборы. Нужды без своих сборов на
            сцену не приезжают. */}
        {summary && summary.stations.length > 0 ? (
          <CampaignRoute stations={summary.stations.map((station) => ({ ...station, art: needArt(station.tag) }))} />
        ) : null}

        {/* Финальный призыв: секция 5 плана. Заменила янтарную карточку
            «Просто помочь», которая стояла последней в сетке и говорила
            ровно это же. */}
        <CampaignCall />

        {/* Разметка для поисковика стоит в конце содержимого: React 19
            переносит теги головы сам, а этот скрипт должен остаться в теле. */}
        <script
          id="camp-list-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
        />
      </main>

      {/* Окно помощи: кнопки «Помочь» на карточках, «Сделать взнос» в финале
          и «Помочь без цели» в пустом состоянии открывают его здесь, а не
          уводят на главную. Ленты помощников в нём нет, поэтому и запроса за
          ней страница больше не делает. */}
      <CampaignDonateDialog />
    </div>
  );
}
