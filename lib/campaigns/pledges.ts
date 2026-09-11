import { campaignsService } from "@/lib/api/services/campaigns";
import { donationsService } from "@/lib/api/services/donations";

/**
 * Сборы, пересчитанные во взносы.
 *
 * Доля собранного на этой странице от 2 до 21 процента, и сцена, которая
 * рисует долю площадью, на таких числах читается как незагрузившаяся
 * картинка. Поэтому величина берётся другой единицей: взносом.
 *
 * Взнос на странице ровно один, 500 ₽, его подставляет кнопка «Помочь». В нём
 * цель считается целым числом, и «сделано 38 из 550» читается как счёт людей,
 * а не как пустая полоска. Число при этом то же самое.
 */

/** Шаг взноса. Тот же, что уходит в поток оплаты с карточки сбора. */
export const PLEDGE = 500;

/**
 * Сколько меток поле выдерживает.
 *
 * Метка рисуется узлом, и на трёх тысячах узлов страница начинает думать.
 * Предел стоит не ради красоты: сборы заводит человек, и один сбор на
 * миллион рублей растянул бы поле на две тысячи меток.
 */
const MAX_MARKS = 1200;

/** Ступени укрупнения метки, если целей набралось слишком много. */
const UNITS = [PLEDGE, 1000, 2000, 5000, 10000];

/** Подпись, за которой никого не видно: в перекличку такие не попадают. */
const ANONYMOUS = /^анонимн/i;

/** Сколько имён помещается в строку, прежде чем она станет списком. */
const NAMES_SHOWN = 5;

export interface PledgeField {
  /** Цена одной метки в рублях. */
  unit: number;
  /** Сколько сборов открыто. */
  funds: number;
  /** Сумма целей всех открытых сборов. */
  goal: number;
  /** Сколько на них уже собрано. */
  got: number;
  /** Всего меток в поле. */
  places: number;
  /** Метки, которые уже оплачены. */
  taken: number;
  /** Метки, которые ещё ждут. */
  free: number;
  /** Сколько взносов реально пришло. Ноль, если счёт не сошёлся с деньгами. */
  pledges: number;
  /** Названные жертвователи по одному разу, в порядке появления. */
  donors: string[];
  /** Были ли взносы без подписи. */
  anonymous: boolean;
}

/** Имена в перекличку: каждое по разу, неназвавшиеся отдельным признаком. */
function roll(names: string[]): { donors: string[]; anonymous: boolean } {
  const donors: string[] = [];
  let anonymous = false;

  for (const name of names) {
    if (!name || ANONYMOUS.test(name)) {
      anonymous = true;
      continue;
    }
    if (!donors.includes(name)) donors.push(name);
  }

  return { donors: donors.slice(0, NAMES_SHOWN), anonymous };
}

/** Метка покрупнее, если в 500 ₽ поле не помещается. Последняя ступень крайняя. */
function unitFor(goal: number): number {
  for (const unit of UNITS) {
    if (Math.ceil(goal / unit) <= MAX_MARKS) return unit;
  }
  return UNITS[UNITS.length - 1];
}

/**
 * Поле взносов по всем открытым сборам.
 *
 * Считается по всем открытым сборам, а не по странице списка: фильтр и
 * номер страницы под сценой меняются, а нужда приюта от этого не меняется.
 *
 * Счёт взносов берётся из хранилища и сверяется с деньгами. Не сошлось,
 * значит часть взносов прошла мимо CMS, и число в тексте не называется:
 * промолчать лучше, чем назвать неверное.
 */
export async function getPledgeField(): Promise<PledgeField | null> {
  const [funds, pledged] = await Promise.all([
    campaignsService.getCampaigns({ status: "active", limit: 100 }),
    donationsService.getActiveCampaignRoll(),
  ]);

  const open = funds.data || [];
  if (open.length === 0) return null;

  const goal = open.reduce((sum, fund) => sum + (Number(fund.total) || 0), 0);
  const got = open.reduce((sum, fund) => sum + (Number(fund.current) || 0), 0);
  if (goal <= 0) return null;

  const unit = unitFor(goal);
  const places = Math.ceil(goal / unit);
  const taken = Math.max(0, Math.min(places, Math.floor(got / unit)));
  const counted = Math.round(pledged.sum) === Math.round(got);
  const { donors, anonymous } = roll(counted ? pledged.names : []);

  return {
    unit,
    funds: open.length,
    goal,
    got,
    places,
    taken,
    free: places - taken,
    pledges: counted ? pledged.count : 0,
    donors,
    anonymous,
  };
}
