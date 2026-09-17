import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowUpRight, BookOpen, CalendarDays, CalendarHeart, CheckCircle2, Flag, HandHeart, HeartHandshake, HouseHeart, PawPrint, Tag, UsersRound } from "lucide-react";

import { CampaignCall } from "@/components/campaigns/campaign-call";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignCountdown } from "@/components/campaigns/campaign-countdown";
import { CampaignDonateDialog } from "@/components/campaigns/campaign-donate-dialog";
import { CampaignDonateForm } from "@/components/campaigns/campaign-donate-form";
import { CampaignFormLink } from "@/components/campaigns/campaign-form-link";
import { CampaignMobileCta } from "@/components/campaigns/campaign-mobile-cta";
import { CampaignPhotos } from "@/components/campaigns/campaign-photos";
import { CampaignReveal } from "@/components/campaigns/campaign-reveal";
import { CampaignShare } from "@/components/campaigns/campaign-share";
import { FundTabs } from "@/components/campaigns/fund-tabs";
import { CampaignStory } from "@/components/campaigns/campaign-story";
import { CampaignTitle } from "@/components/campaigns/campaign-title";
import { InnerHeader } from "@/components/layout/inner-header";
import { aboutPageService } from "@/lib/api/services/about-page";
import { campaignsService } from "@/lib/api/services/campaigns";
import { resolveCovers } from "@/lib/campaigns/cover";
import { fundDate, fundPhotos, loadFund } from "@/lib/campaigns/fund";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";
import { siteUrl } from "@/lib/seo/site";
import "@/components/campaigns/campaigns.css";

/**
 * Страница одного сбора.
 *
 * Тёплые цветные поля каталога, крупный снимок, спокойная типографика.
 * Форма на странице и окно помощи используют общие поля пожертвования.
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
      url: siteUrl(`/campaigns/${fund.slug || fund.documentId}`),
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
  const [fund, othersData, about] = await Promise.all([
    loadFund(id),
    campaignsService.getCampaigns({ status: "active", limit: 4 }),
    /* Текст вкладки «О фонде» ведётся в CMS вместе со страницей фонда: своя
       копия здесь разошлась бы с ней на первой же правке. */
    aboutPageService.getAboutPage(),
  ]);

  if (!fund) notFound();
  if (fund.slug && id !== fund.slug) permanentRedirect(`/campaigns/${encodeURIComponent(fund.slug)}`);

  // Independent media checks run together. The hero Image already renders
  // eager/high-priority markup on the server; preloading its raw URL would
  // download the original in addition to Next's responsive image.
  const [photos, others] = await Promise.all([
    fundPhotos(fund),
    resolveCovers(
      (othersData.data || [])
        .filter((item) => item.documentId !== fund.documentId)
        .slice(0, 3)
        .map(normalizeCampaignData),
    ),
  ]);

  const total = Number(fund.total) || 0;
  const current = Number(fund.current) || 0;
  const share = total > 0 ? Math.min(1, current / total) : 0;
  const rest = Math.max(0, total - current);
  const closed = fund.status === "closed";

  const started = fundDate(fund.publishedAt || fund.createdAt);
  const deadline = fund.deadline ? new Date(fund.deadline) : null;

  /* Про фонд коротко: чем занимаемся, как работаем и откуда взялись. Дальше
     читателя ведёт ссылка на страницу фонда. */
  const shelter = [about.heroIntro, about.missionBody, about.historyBody.split(/\n{2,}/)[0]]
    .map((piece) => piece?.trim())
    .filter((piece): piece is string => Boolean(piece));

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
    <div className="camp camp--fund">
      <InnerHeader />

      <main id="main-content">
        {/* Поле сбора: слева всё о нём, справа кадр в круге. Точки лежат по
            всему полю, как на обложке каталога. */}
        <section className="fund-cover" data-status={closed ? "closed" : "active"}>
          <div className="camp-inner fund-cover__inner">
            <CampaignReveal className="fund-cover__copy" entrance>
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

              <CampaignTitle title={fund.title} />

              {fund.shortDesc ? <p className="fund-cover__lead">{fund.shortDesc}</p> : null}
            </CampaignReveal>

            <CampaignPhotos photos={photos} title={fund.title} />

            {/* Деньги, кнопка и сроки стоят отдельным блоком: на узком экране
                они уходят под кадр, а заголовок с описанием остаются над ним. */}
            <CampaignReveal className="fund-cover__deal" entrance delay={.06}>
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
                  <span className="fund-money__percent" aria-hidden="true">{Math.round(share * 100)}%</span>
                </div>

                <div className="fund-money__sums">
                  <div><small>Собрано</small><b>{money(current)}</b></div>
                  <div><small>Цель сбора</small><strong>{money(total)}</strong></div>
                </div>
                <p className="fund-money__rest">{closed ? "Сбор завершён" : rest > 0 ? `Осталось собрать ${money(rest)}` : "Цель собрана"}</p>
              </div>

              <div className="fund-cover__actions" id="fund-help">
                {closed ? (
                  <span className="fund-closed">
                    <CheckCircle2 aria-hidden="true" size={17} />
                    Сбор закрыт, спасибо всем, кто помог
                  </span>
                ) : (
                  <CampaignFormLink />
                )}
              </div>

              <p className="fund-dates">
                <span>
                  <CalendarDays aria-hidden="true" size={18} />
                  <small>Открыт</small>
                  <b>{started}</b>
                </span>
                <span>
                  <Flag aria-hidden="true" size={18} />
                  <small>{closed ? "Итог" : "Срок"}</small>
                  <b>
                    {closed
                      ? "Сбор завершён"
                      : deadline
                        ? `до ${fundDate(fund.deadline)}`
                        : "до сбора цели"}
                  </b>
                </span>
              </p>
              <CampaignShare title={fund.title} url={siteUrl(`/campaigns/${fund.slug || fund.documentId}`)} />
            </CampaignReveal>
          </div>
        </section>

        {/* Две вкладки вместо заголовка: сам сбор и фонд, который его ведёт.
            Второе читателю нужно ровно тогда, когда он решает, можно ли сюда
            переводить деньги, и отдельной страницей это вопрос не снимает. */}
        <section aria-labelledby="fund-story-title" className="fund-story">
          <CampaignReveal className="camp-inner">
            <h2 className="sr-only" id="fund-story-title">
              Подробности сбора
            </h2>
            <FundTabs
              label="О сборе и о фонде"
              tabs={[
                {
                  key: "fund",
                  label: "О сборе",
                  icon: <BookOpen size={22} />,
                  panel: (
                    <div className="fund-story__text">
                      <CampaignStory text={fund.longDesc || fund.shortDesc || ""} />
                    </div>
                  ),
                },
                {
                  key: "shelter",
                  label: "О фонде",
                  icon: <HouseHeart size={22} />,
                  panel: (
                    <div className="fund-story__text">
                      <CampaignStory text={shelter.join("\n\n")} />
                      <p>
                        <Link className="fund-story__more" href="/about">
                          Всё о фонде: команда, отчёты, документы
                          <ArrowUpRight aria-hidden="true" size={16} />
                        </Link>
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </CampaignReveal>
        </section>

        {/* Взнос и помощники тоже парой: форма та же, что на главной, без
            вкладок панели и без подопечного над кромкой. */}
        <section aria-labelledby="fund-help-title" className="fund-backers">
          <CampaignReveal className="camp-inner">
            <h2 className="sr-only" id="fund-help-title">
              Поддержать сбор
            </h2>
            <FundTabs
              label="Взнос и помощники сбора"
              anchorId="fund-contribution"
              heightFrom="give"
              tabs={[
                {
                  key: "give",
                  label: "Сделать взнос",
                  icon: <HeartHandshake size={22} />,
                  panel: (
                    <div className="fund-form">
                      <CampaignDonateForm
                        listenForIntent={false}
                        initial={{ kind: "campaign", id: fund.documentId, title: fund.title, amount: 500 }}
                      />
                    </div>
                  ),
                },
                {
                  key: "heroes",
                  label: "Наши герои",
                  icon: <UsersRound size={22} />,
                  panel:
                    backers.length > 0 ? (
                      <div>
                        <ul className="fund-backers__list">
                          {backers.map((backer) => (
                            <li key={backer.id} data-monthly={backer.monthly}>
                              <span className="fund-backer__who">
                                <span aria-hidden="true" className="fund-backer__mark">
                                  {backer.monthly ? <CalendarHeart size={24} /> : <HandHeart size={24} />}
                                </span>
                                <span className="fund-backer__identity">
                                  {backer.name}
                                  <small className="fund-backer__kind">{backer.monthly ? "Опека · каждый месяц" : "Разовый взнос"}</small>
                                </span>
                              </span>
                              <span className="fund-backer__when"><CalendarDays aria-hidden="true" size={14} />{backer.date}</span>
                              <b className="fund-backer__amount">{money(backer.amount)}{backer.monthly && <small>/ мес.</small>}</b>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      /* Пустое состояние карточкой, как в каталоге: строка
                         текста посреди пустого поля читается сбоем загрузки. */
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
                      </div>
                    ),
                },
              ]}
            />
          </CampaignReveal>
        </section>

        {others.length > 0 ? (
          <section aria-labelledby="fund-more-title" className="fund-more">
            <CampaignReveal className="camp-inner">
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
            </CampaignReveal>
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
        <CampaignMobileCta anchor="fund-help" />
      )}

      <CampaignDonateDialog />
    </div>
  );
}
