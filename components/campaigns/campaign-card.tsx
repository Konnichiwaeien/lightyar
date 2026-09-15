import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, PawPrint, Tag } from "lucide-react";

import { CampaignHelpButton } from "@/components/campaigns/campaign-help-button";
import type { CampaignShot } from "@/lib/campaigns/cover";
import type { MappedCampaign } from "@/lib/helpers/campaigns/normalize-campaign-data";

/**
 * Карточка сбора в сетке.
 *
 * Кадр это круг, за ним выглядывает плоский малый круг: та же пара «фигура за
 * вырезкой», что держит поля выше и ниже. Обрезка круга лежит на ссылке, а
 * малый круг на обёртке, иначе он был бы срезан вместе с углами.
 *
 * Карточка вынесена из каталога, когда те же сборы понадобились в конце
 * страницы одного сбора. Там стояла своя разметка с прямоугольным кадром в
 * рамке, и две витрины одного и того же расходились по виду.
 *
 * Номер в сетке приходит снаружи: от него считается очередь входа по
 * прокрутке и вид малого круга, чтобы ряд не читался строкой одинаковых
 * кругов.
 */

/** Рубли без копеек: у сборов суммы круглые, копейки только шумят. Форматтер
    один на модуль: создавать его на каждый вызов дорого. */
const RUB = new Intl.NumberFormat("ru-RU");
export const money = (value: number) => `${RUB.format(Math.round(value))} ₽`;

export type CampaignCardFund = MappedCampaign & { shot: CampaignShot };

export function CampaignCard({ fund, index }: { fund: CampaignCardFund; index: number }) {
  const share = fund.total > 0 ? Math.min(1, fund.current / fund.total) : 0;
  const rest = Math.max(0, fund.total - fund.current);

  return (
    <li className="camp-item" data-status={fund.status} style={{ "--i": index } as React.CSSProperties}>
      <div className="camp-item__figure">
        <Link className="camp-item__shot" href={`/campaigns/${fund.id}`} aria-label={fund.title}>
          {fund.shot.src ? (
            <Image
              src={fund.shot.src}
              alt=""
              width={640}
              height={640}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
            />
          ) : null}
        </Link>
      </div>

      {/* Тег и имя подопечного это бейджи, и оба стоят на листе, а не на
          снимке: у круга нет углов, и на кромке их срезало. Сбор ради
          конкретного подопечного видно по бейджу с лапой: раньше имя стояло
          тихой капителью у заголовка и читалось его частью. */}
      <p className="camp-item__meta">
        <span className="camp-badge camp-badge--tag">
          <Tag aria-hidden="true" size={12} />
          {fund.tag}
        </span>
        {/* В бейдже одно имя, без предлога: клички приходят из CMS в
            именительном падеже, и «сбор для Бакс» читалось бы ошибкой. Смысл
            добирает подпись для читалки. */}
        {fund.petName ? (
          <span aria-label={`Сбор ради подопечного: ${fund.petName}`} className="camp-badge camp-badge--pet">
            <PawPrint aria-hidden="true" size={12} />
            {fund.petName}
          </span>
        ) : null}
      </p>

      <h3 className="camp-item__title">
        <Link href={`/campaigns/${fund.id}`}>{fund.title}</Link>
      </h3>
      <p className="camp-item__desc">{fund.desc}</p>

      <div
        className="camp-item__bar"
        role="progressbar"
        aria-valuenow={fund.current}
        aria-valuemin={0}
        aria-valuemax={fund.total}
        aria-label={`Собрано ${fund.current} рублей из ${fund.total}`}
      >
        <i style={{ "--fill": `${share * 100}%` } as React.CSSProperties} />
      </div>

      <p className="camp-item__money">
        <b>{money(fund.current)}</b>
        <span>
          {fund.status === "closed"
            ? `цель ${money(fund.total)}`
            : rest > 0
              ? `осталось ${money(rest)}`
              : "цель собрана"}
        </span>
      </p>

      <div className="camp-item__actions">
        {fund.status === "active" ? (
          <CampaignHelpButton id={fund.id} title={fund.title} />
        ) : (
          <span className="camp-item__closed">
            <CheckCircle2 size={17} aria-hidden="true" /> Сбор закрыт
          </span>
        )}
        {/* Подпись для читалки называет сбор: «Подробнее» в списке ссылок само
            по себе не говорит ни о чём. */}
        <Link
          aria-label={`Подробнее о сборе: ${fund.title}`}
          className="camp-btn camp-btn--quiet"
          href={`/campaigns/${fund.id}`}
        >
          Подробнее
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
