import { campaignsService } from "@/lib/api/services/campaigns";

/**
 * Сводка по всем открытым сборам.
 *
 * Считается по всем открытым сборам, а не по странице списка: фильтр и номер
 * страницы под обложкой меняются, а нужда приюта от этого не меняется.
 */

/** Шаг взноса. Тот же, что подставляет кнопка «Помочь» на карточке сбора. */
export const PLEDGE = 500;

/**
 * Станции ленты «Куда уходит взнос».
 *
 * Координата это центр станции в долях длины картины. Осталась от ленты,
 * которая ехала вбок по прокрутке; ленту сняли, сцена теперь собирается
 * вокруг подопечного, и координата участвует только в порядке подписей.
 */
const STATIONS: { at: number; tag: string }[] = [
  { at: 0.22, tag: "Корм" },
  { at: 0.39, tag: "Медицина" },
  { at: 0.56, tag: "Реабилитация" },
  { at: 0.73, tag: "Срочно" },
];

/**
 * Момент, когда подпись станции договаривает, в долях пути ленты.
 *
 * Станция выходит на середину экрана при прогрессе (at * r - 0.5) / (r - 1),
 * где r это длина ленты в окнах. r зависит от ширины экрана, поэтому точное
 * число в CSS не посчитать: там нельзя поделить длину на длину. Берём прямую,
 * проведённую по типичному рабочему столу, где лента длиной в 2,4 окна.
 * Зависимость от at при любом r остаётся прямой, меняется только наклон,
 * поэтому порядок подписей верен на всех ширинах, а расходится только их
 * точный момент, и расходится в пределах десятой доли пути.
 */
const say = (at: number) => Math.min(0.98, Math.max(0.14, 1.714 * at - 0.357));

export interface RouteStation {
  /** Центр станции в долях длины ленты. */
  at: number;
  /** Тег сбора, он же подпись станции. */
  tag: string;
  /** Сколько собрано по этому тегу. */
  collected: number;
  /** Сумма целей открытых сборов этого тега: «собрано из». */
  goal: number;
  /** Доля пути, к которой подпись станции проявлена целиком. */
  say: number;
  /** Сбор, на который ведёт нужда. Первый открытый с этим тегом. */
  id: string;
  /** Его название: оно уходит в подпись ссылки для читалки. */
  title: string;
}

export interface CampaignSummary {
  /** Сколько сборов открыто. */
  funds: number;
  /** Сумма целей. */
  goal: number;
  /** Сколько уже собрано. */
  got: number;
  /** Сколько не хватает до всех целей. */
  rest: number;
  /** Станции ленты: только те, у которых есть открытые сборы. */
  stations: RouteStation[];
}

export async function getCampaignSummary(): Promise<CampaignSummary | null> {
  const data = await campaignsService.getCampaigns({ status: "active", limit: 100 });
  const open = data.data || [];
  if (open.length === 0) return null;

  const goal = open.reduce((sum, fund) => sum + (Number(fund.total) || 0), 0);
  const got = open.reduce((sum, fund) => sum + (Number(fund.current) || 0), 0);

  /* Станция без своих сборов подписи не получает: ноль рублей под предметом
     читался бы поломкой, а не правдой. Предметы на картине при этом остаются,
     она одна на все состояния данных. */
  const stations = STATIONS.map((station) => {
    const own = open.filter((fund) => (fund.tag || "").trim().toLowerCase() === station.tag.toLowerCase());
    return {
      ...station,
      say: say(station.at),
      collected: own.reduce((sum, fund) => sum + (Number(fund.current) || 0), 0),
      goal: own.reduce((sum, fund) => sum + (Number(fund.total) || 0), 0),
      id: own[0]?.documentId ?? "",
      title: own[0]?.title ?? "",
    };
  }).filter((station) => station.collected > 0 && station.id);

  return { funds: open.length, goal, got, rest: Math.max(0, goal - got), stations };
}
