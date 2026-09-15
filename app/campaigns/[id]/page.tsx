import ReactDOM from "react-dom";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, CheckCircle2, Flag, HandHeart, PawPrint, Tag } from "lucide-react";

import { CampaignCall } from "@/components/campaigns/campaign-call";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignCountdown } from "@/components/campaigns/campaign-countdown";
import { CampaignDonateDialog } from "@/components/campaigns/campaign-donate-dialog";
import { CampaignHelpButton } from "@/components/campaigns/campaign-help-button";
import { CampaignMobileCta } from "@/components/campaigns/campaign-mobile-cta";
import { CampaignPhotos } from "@/components/campaigns/campaign-photos";
import { CampaignShare } from "@/components/campaigns/campaign-share";
import { InnerHeader } from "@/components/layout/inner-header";
import { campaignsService } from "@/lib/api/services/campaigns";
import { resolveCovers } from "@/lib/campaigns/cover";
import { fundDate, fundPhotos, loadFund } from "@/lib/campaigns/fund";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";
import { plural } from "@/lib/reports/shelter-scales";
import { siteUrl } from "@/lib/seo/site";
import "@/components/campaigns/campaigns.css";

/**
 * Страница одного сбора.
 *
 * Собрана в том же языке, что и каталог: плоские цветные поля одно под
 * другим, кадр это круг с плоской фигурой за ним, значки рисованные,
 * прямоугольных фотоблоков нет. До переделки страница жила своей жизнью:
 * белые карточки с тенями, эмодзи вместо значков, снимки в рамках и своя
 * форма взноса в липкой колонке — вторая копия той, что и так открывается
 * окном по кнопке «Помочь».
 *
 * Разбор грамматики: docs/campaigns-scroll-plan.md.
 */

/* Страница собирается заранее и обновляется раз в минуту: суммы сбора
   меняются, и час, стоявший здесь раньше, показывал вчерашние деньги. Список
   адресов для сборки приходит из generateStaticParams, новый сбор появится
   по первому запросу. */
export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fund = await loadFund(id);

  if (!fund) return { title: "Сбор не найден" };

  const description = fund.shortDesc || "Сбор помощи бездомным животным в Ярославле.";
  const cover = (await fundPhotos(fund))[0] ?? siteUrl("/og-image.jpg");

  return {
    title: `${fund.title} | Сборы`,
    description,
    alternates: { canonical: `/campaigns/${fund.slug || fund.documentId}` },
    openGraph: {
      title: `${fund.title} — АНБО «Светлый»`,
      description,
      images: [{ url: cover, width: 1200, height: 630, alt: fund.title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: fund.title, description, images: [cover] },
  };
}

export async function generateStaticParams() {
  const identifiers = await campaignsService.getAllCampaignIdentifiers();
  return identifiers.flatMap((item) => [
    ...(item.id ? [{ id: item.id }] : []),
    ...(item.slug ? [{ id: item.slug }] : []),
  ]);
}

const RUB = new Intl.NumberFormat("ru-RU");
const money = (value: number) => `${RUB.format(Math.round(value))} ₽`;

export default async function FundPage({ params }: PageProps) {
  const { id } = await params;

  /* Сбор и соседние сборы едут разом: второй запрос не зависит от первого, а
     последовательно они складывались в лесенку из двух обходов CMS. */
  const [fund, othersData] = await Promise.all([
    loadFund(id),
    campaignsService.getCampaigns({ status: "active", limit: 4 }),
  ]);

  if (!fund) notFound();

  const photos = await fundPhotos(fund);
  /* Первый кадр это самый крупный элемент первого экрана. Он лежит в
     клиентском островке, и без этой строки его загрузка начиналась после
     гидратации. */
  if (photos[0]) ReactDOM.preload(photos[0], { as: "image", fetchPriority: "high" });

  const total = Number(fund.total) || 0;
  const current = Number(fund.current) || 0;
  const share = total > 0 ? Math.min(1, current / total) : 0;
  const rest = Math.max(0, total - current);
  const closed = fund.status === "closed";

  const started = fundDate(fund.publishedAt || fund.createdAt);
  const deadline = fund.deadline ? new Date(fund.deadline) : null;

  const story = (fund.longDesc || fund.shortDesc || "")
    .split(/\n{2,}/)
    .map((piece) => piece.trim())
    .filter(Boolean);

  /* Взносы в сбор: свежие сверху. Имена приходят такими, какими их оставил
     помощник, безымянный взнос подписан приютом. */
  const backers = [...(fund.donations ?? [])]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .map((donation) => ({
      id: donation.documentId ?? `${donation.id}`,
      name: donation.donorName || "Анонимный помощник",
      monthly: donation.type === "monthly",
      date: fundDate(donation.publishedAt || donation.createdAt),
      amount: Number(donation.amount) || 0,
    }));

  /* Показываем дюжину свежих: у долгого сбора взносов бывают сотни, и
     страница выросла бы в ленту, где после первого экрана уже ничего нет. */
  const shownBackers = backers.slice(0, 12);
  const restBackers = backers.length - shownBackers.length;

  const others = await resolveCovers(
    (othersData.data || [])
      .filter((item) => item.documentId !== fund.documentId)
      .slice(0, 3)
      .map(normalizeCampaignData),
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Сборы", item: siteUrl("/campaigns") },
      { "@type": "ListItem", position: 3, name: fund.title },
    ],
  };

  return (
    <div className="camp">
      <InnerHeader />

      <main id="main-content">
        {/* Поле сбора: слева всё о нём, справа кадр в круге. Точки лежат по
            всему полю, как на обложке каталога. */}
        <section className="fund-cover" data-status={closed ? "closed" : "active"}>
          <div className="camp-inner fund-cover__inner">
            <div className="fund-cover__copy">
              <nav aria-label="Где вы находитесь" className="fund-crumbs">
                <Link href="/">Главная</Link>
                <span aria-hidden="true">/</span>
                <Link href="/campaigns">Сборы</Link>
              </nav>

              <p className="fund-cover__badges">
                <span className="camp-badge camp-badge--tag">
                  <Tag aria-hidden="true" size={12} />
                  {fund.tag || "Срочно"}
                </span>
                {fund.pet?.name ? (
                  <span
                    aria-label={`Сбор ради подопечного: ${fund.pet.name}`}
                    className="camp-badge camp-badge--pet"
                  >
                    <PawPrint aria-hidden="true" size={12} />
                    {fund.pet.name}
                  </span>
                ) : null}
                {closed ? (
                  <span className="camp-badge camp-badge--done">
                    <CheckCircle2 aria-hidden="true" size={12} />
                    Сбор закрыт
                  </span>
                ) : (
                  <CampaignCountdown deadline={fund.deadline ?? null} />
                )}
              </p>

              <h1 className="fund-cover__title">{fund.title}</h1>

              {fund.shortDesc ? <p className="fund-cover__lead">{fund.shortDesc}</p> : null}
            </div>

            <CampaignPhotos photos={photos} title={fund.title} />

            {/* Деньги, кнопка и сроки стоят отдельным блоком: на узком экране
                они уходят под кадр, а заголовок с описанием остаются над ним. */}
            <div className="fund-cover__deal">
              <div className="fund-money">
                <div
                  aria-label={`Собрано ${current} рублей из ${total}`}
                  aria-valuemax={total}
                  aria-valuemin={0}
                  aria-valuenow={current}
                  className="camp-item__bar fund-money__bar"
                  data-status={closed ? "closed" : "active"}
                  role="progressbar"
                >
                  <i style={{ "--fill": `${share * 100}%` } as React.CSSProperties} />
                </div>

                <p className="fund-money__sums">
                  <b>{money(current)}</b>
                  <span>
                    {closed
                      ? `цель ${money(total)}`
                      : rest > 0
                        ? `осталось ${money(rest)} из ${money(total)}`
                        : "цель собрана"}
                  </span>
                </p>
              </div>

              <div className="fund-cover__actions" id="fund-help">
                {closed ? (
                  <span className="fund-closed">
                    <CheckCircle2 aria-hidden="true" size={17} />
                    Сбор закрыт, спасибо всем, кто помог
                  </span>
                ) : (
                  <CampaignHelpButton id={fund.documentId} title={fund.title} />
                )}
                <CampaignShare title={fund.title} />
              </div>

              <p className="fund-dates">
                <span>
                  <CalendarDays aria-hidden="true" size={14} />
                  Открыт {started}
                </span>
                <span>
                  <Flag aria-hidden="true" size={14} />
                  {closed
                    ? "Сбор завершён"
                    : deadline
                      ? `Срок до ${fundDate(fund.deadline)}`
                      : "Идёт до сбора цели"}
                </span>
              </p>
            </div>
          </div>
        </section>

        {story.length > 0 ? (
          <section aria-labelledby="fund-story-title" className="fund-story">
            <div className="camp-inner">
              <h2 className="fund-title" id="fund-story-title">
                О <em>сборе</em>
              </h2>
              <div className="fund-story__text">
                {story.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="fund-backers-title" className="fund-backers">
          <div className="camp-inner">
            <h2 className="fund-title" id="fund-backers-title">
              {backers.length > 0 ? (
                <>
                  {backers.length} {plural(backers.length, "взнос", "взноса", "взносов")} <em>в этот сбор</em>
                </>
              ) : (
                <>
                  Взносов <em>пока нет</em>
                </>
              )}
            </h2>

            {backers.length > 0 ? (
              <ul className="fund-backers__list">
                {shownBackers.map((backer) => (
                  <li key={backer.id}>
                    <span className="fund-backer__who">
                      <span aria-hidden="true" className="fund-backer__mark">
                        <HandHeart size={16} />
                      </span>
                      {backer.name}
                    </span>
                    <span className="fund-backer__when">
                      {backer.date}
                      {backer.monthly ? " · ежемесячно" : ""}
                    </span>
                    <b>{money(backer.amount)}</b>
                  </li>
                ))}
              </ul>
            ) : null}

            {restBackers > 0 ? (
              <p className="fund-backers__more">
                и ещё {restBackers} {plural(restBackers, "взнос", "взноса", "взносов")} до них
              </p>
            ) : null}

            {backers.length === 0 ? (
              /* Пустое состояние карточкой, как в каталоге: строка текста
                 посреди пустого поля читается сбоем загрузки. */
              <div className="camp-blank">
                <span aria-hidden="true" className="camp-blank__badge">
                  <HandHeart size={30} />
                </span>
                <h3>Этот сбор ещё никто не поддержал</h3>
                <p>
                  {closed
                    ? "Сбор закрыт без взносов через сайт: на нужду нашлись другие деньги."
                    : "Первый взнос виден остальным и обычно тянет за собой следующие. Любая сумма идёт этому сбору."}
                </p>
                {closed ? null : <CampaignHelpButton id={fund.documentId} title={fund.title} />}
              </div>
            ) : null}
          </div>
        </section>

        {others.length > 0 ? (
          <section aria-labelledby="fund-more-title" className="fund-more">
            <div className="camp-inner">
              <header className="camp-list__head">
                <div className="camp-list__title">
                  <h2 className="fund-title" id="fund-more-title">
                    Другие <em>сборы</em>
                  </h2>
                </div>
                <Link className="camp-btn camp-btn--quiet fund-more__all" href="/campaigns">
                  Весь каталог
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </header>

              <ul className="camp-grid">
                {others.map((item, index) => (
                  <CampaignCard fund={item} index={index} key={item.id} />
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <CampaignCall />

        {/* Разметка для поисковика стоит в конце содержимого: React 19
            переносит теги головы сам, а этот скрипт должен остаться в теле. */}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          id="fund-jsonld"
          type="application/ld+json"
        />
      </main>

      {closed ? null : (
        <CampaignMobileCta anchor="fund-help" id={fund.documentId} title={fund.title} />
      )}

      <CampaignDonateDialog />
    </div>
  );
}
