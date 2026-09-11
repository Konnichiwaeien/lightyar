import type { AboutStatistic } from "./about-content";

/* Оттенки читаются и на кремовом фоне раздела, и рядом друг с другом. */
const STATISTIC_COLORS = ["#f59e0b", "#6f7569", "#a35a26", "#8a9bab", "#7a6a4f"] as const;

export interface AboutStatisticSegment extends AboutStatistic {
  color: string;
  safeValue: number;
  share: number;
  start: number;
  end: number;
}

export interface AboutStatisticComposition {
  total: number;
  gradient: string;
  segments: AboutStatisticSegment[];
}

export function buildAboutStatisticSegments(items: readonly AboutStatistic[]): AboutStatisticComposition {
  const safeValues = items.map((item) => Math.max(0, Number.isFinite(item.value) ? item.value : 0));
  const total = safeValues.reduce((sum, value) => sum + value, 0);
  let cursor = 0;

  const segments = items.map<AboutStatisticSegment>((item, index) => {
    const safeValue = safeValues[index];
    const rawShare = total > 0 ? (safeValue / total) * 100 : 0;
    const share = Number(rawShare.toFixed(1));
    const start = cursor;
    const end = total > 0
      ? (index === items.length - 1 ? 360 : cursor + (safeValue / total) * 360)
      : 0;
    cursor = end;

    return {
      ...item,
      color: STATISTIC_COLORS[index % STATISTIC_COLORS.length],
      safeValue,
      share,
      start,
      end,
    };
  });

  const gradient = total > 0
    ? segments.map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`).join(", ")
    : "rgba(255, 255, 255, 0.14) 0deg 360deg";

  return { total, gradient, segments };
}
