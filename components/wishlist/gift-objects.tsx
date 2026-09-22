"use client";

import { useState } from "react";

/**
 * Рисованные предметы вишлиста.
 *
 * У позиций в CMS фотографий нет, а витрина маркетплейса на тёплой бумаге
 * смотрится чужеродно: белые фоны, разные ракурсы, логотипы. Поэтому каждая
 * категория получает свой контурный рисунок — одна толщина линии, одна
 * скруглённая манера, янтарь только как заливка-акцент.
 *
 * Категория угадывается по названию позиции. Незнакомая позиция получает
 * коробку — честный нейтральный предмет, а не пустое место.
 */

type ObjectProps = { className?: string };

/** Общие параметры обводки: одна манера на весь набор. */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const AMBER = "var(--w-amber, #f59e0b)";

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" focusable="false">
      {children}
    </svg>
  );
}

/** Паучи влажного корма — стопка из трёх пакетиков. */
function WetFood({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M14 26h30a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V29a3 3 0 0 1 3-3Z" fill={AMBER} opacity="0.22" stroke="none" />
      <path d="M14 26h30a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V29a3 3 0 0 1 3-3Z" {...S} />
      <path d="M11 33h36" {...S} />
      <path d="M20 21h18l-2 5H22l-2-5Z" {...S} />
      <path d="M50 31h4a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-4" {...S} opacity="0.5" />
      <circle cx="24" cy="43" r="2.4" fill={AMBER} stroke="none" />
      <path d="M31 41h10M31 47h7" {...S} />
    </Frame>
  );
}

/** Пакет сухого корма — мягкий мешок с загнутым верхом. */
function DryFood({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M18 20c8-3 20-3 28 0l4 32c0 5-7 8-18 8s-18-3-18-8l4-32Z" fill={AMBER} opacity="0.18" stroke="none" />
      <path d="M18 20c8-3 20-3 28 0l4 32c0 5-7 8-18 8s-18-3-18-8l4-32Z" {...S} />
      <path d="M18 20c3 4 25 4 28 0" {...S} />
      <path d="M22 13c5-3 15-3 20 0-2 4-4 6-10 6s-8-2-10-6Z" {...S} />
      <circle cx="27" cy="38" r="2" fill={AMBER} stroke="none" />
      <circle cx="35" cy="43" r="2" fill={AMBER} stroke="none" />
      <circle cx="30" cy="47" r="1.6" fill={AMBER} stroke="none" />
    </Frame>
  );
}

/** Наполнитель — мешок с гранулами и мерным совком. */
function Litter({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M16 22h32l3 30a5 5 0 0 1-5 6H18a5 5 0 0 1-5-6l3-30Z" fill={AMBER} opacity="0.16" stroke="none" />
      <path d="M16 22h32l3 30a5 5 0 0 1-5 6H18a5 5 0 0 1-5-6l3-30Z" {...S} />
      <path d="M20 22c0-6 5-10 12-10s12 4 12 10" {...S} />
      <path d="M22 34h20" {...S} opacity="0.55" />
      <circle cx="26" cy="45" r="1.8" fill={AMBER} stroke="none" />
      <circle cx="33" cy="49" r="1.8" fill={AMBER} stroke="none" />
      <circle cx="39" cy="44" r="1.8" fill={AMBER} stroke="none" />
    </Frame>
  );
}

/** Лекарства — пузырёк и пара таблеток. */
function Medicine({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M22 24h18a3 3 0 0 1 3 3v26a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4V27a3 3 0 0 1 3-3Z" fill={AMBER} opacity="0.18" stroke="none" />
      <path d="M22 24h18a3 3 0 0 1 3 3v26a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4V27a3 3 0 0 1 3-3Z" {...S} />
      <path d="M25 16h12v8H25z" {...S} />
      <path d="M31 34v12M25 40h12" stroke={AMBER} strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="47" r="7" {...S} />
      <path d="M45.5 43.5 54.5 51" {...S} />
    </Frame>
  );
}

/** Поводок с карабином. */
function Leash({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M18 12h10a4 4 0 0 1 4 4v6" {...S} />
      <circle cx="18" cy="12" r="5" {...S} />
      <path d="M32 22c8 2 12 8 12 15s-6 12-14 12-13-4-13-10 5-9 10-9 8 3 8 7-3 6-6 6" {...S} stroke={AMBER} />
      <circle cx="29" cy="43" r="2.6" fill="currentColor" stroke="none" />
    </Frame>
  );
}

/** Плед — сложённая стопка ткани. */
function Blanket({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M12 34c6-5 34-5 40 0v14c-6 5-34 5-40 0V34Z" fill={AMBER} opacity="0.18" stroke="none" />
      <path d="M12 34c6-5 34-5 40 0v14c-6 5-34 5-40 0V34Z" {...S} />
      <path d="M12 41c6 5 34 5 40 0" {...S} opacity="0.6" />
      <path d="M16 28c6-4 28-4 34 0" {...S} opacity="0.75" />
      <path d="M20 22c5-3 20-3 25 0" {...S} opacity="0.45" />
    </Frame>
  );
}

/** Миска с кормом. */
function Bowl({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M10 32h44c0 12-9 20-22 20S10 44 10 32Z" fill={AMBER} opacity="0.2" stroke="none" />
      <path d="M10 32h44c0 12-9 20-22 20S10 44 10 32Z" {...S} />
      <path d="M6 32h52" {...S} />
      <path d="M20 26c3-4 8-6 12-6s9 2 12 6" {...S} opacity="0.6" />
      <circle cx="26" cy="39" r="2" fill={AMBER} stroke="none" />
      <circle cx="34" cy="42" r="2" fill={AMBER} stroke="none" />
    </Frame>
  );
}

/** Игрушка — мяч с прострочкой. */
function Toy({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <circle cx="32" cy="34" r="20" fill={AMBER} opacity="0.2" stroke="none" />
      <circle cx="32" cy="34" r="20" {...S} />
      <path d="M12 34c8-6 32-6 40 0" {...S} />
      <path d="M32 14c-6 8-6 32 0 40" {...S} opacity="0.7" />
      <path d="M32 14c6 8 6 32 0 40" {...S} opacity="0.35" />
    </Frame>
  );
}

/** Впитывающие пелёнки — стопка листов. */
function Pads({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M14 20h36v26H14z" fill={AMBER} opacity="0.16" stroke="none" />
      <path d="M14 20h36v26H14z" {...S} />
      <path d="M17 50h36M20 55h36" {...S} opacity="0.55" />
      <path d="M22 28h20M22 35h14" {...S} opacity="0.75" />
    </Frame>
  );
}

/** Коробка — предмет по умолчанию. */
function Parcel({ className }: ObjectProps) {
  return (
    <Frame className={className}>
      <path d="M10 24 32 14l22 10v24L32 58 10 48V24Z" fill={AMBER} opacity="0.16" stroke="none" />
      <path d="M10 24 32 14l22 10v24L32 58 10 48V24Z" {...S} />
      <path d="M10 24l22 10 22-10M32 34v24" {...S} />
      <path d="M32 14v20" stroke={AMBER} strokeWidth="3" strokeLinecap="round" fill="none" />
    </Frame>
  );
}

/**
 * Правила подбора. Порядок важен: «влажный корм» должен встретить своё
 * правило раньше общего «корм», иначе оба пакета станут одинаковыми.
 */
const RULES: [RegExp, (props: ObjectProps) => React.JSX.Element, string][] = [
  [/витамин|добавк/i, Medicine, "vitamins"],
  [/влажн|паучи|консерв/i, WetFood, "wet-food"],
  [/сух(ой|ого)?\s*корм|гранул/i, DryFood, "dry-food"],
  [/наполнител|силикагел|древесн/i, Litter, "litter"],
  [/лекарств|витамин|препарат|антибиот|капл|таблет|шприц/i, Medicine, "medicine"],
  [/поводок|ошейник|шлейк|намордник|рулетк/i, Leash, "leash"],
  [/плед|лежанк|подстилк|матрас|одеял/i, Blanket, "blanket"],
  [/миск|поилк|кормушк/i, Bowl, "bowl"],
  [/игрушк|мяч|канат/i, Toy, "toy"],
  [/пелён|пелен|впитыв|салфетк/i, Pads, "pads"],
  [/корм/i, DryFood, "dry-food"],
];


/** Имя файла растра под позицию; незнакомая позиция получает свёрток. */
export function objectSlug(title: string) {
  return RULES.find(([pattern]) => pattern.test(title))?.[2] ?? "parcel";
}

/** Рисунок под название позиции; незнакомое название получает коробку. */
export function GiftObject({ title, className }: { title: string; className?: string }) {
  const match = RULES.find(([pattern]) => pattern.test(title));
  const Drawing = match ? match[1] : Parcel;
  return <Drawing className={className} />;
}

/**
 * Сумка — цель, в которую всё складывается.
 *
 * Ручки нарисованы позади корпуса, поэтому предмет, «падающий» в горловину,
 * проходит между ними и уходит за переднюю стенку: порядок слоёв делает
 * глубину сам, без масок.
 */
export function ToteBag({ className }: ObjectProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="presentation" focusable="false">
      {/* ручки — за корпусом */}
      <path
        d="M74 66V50a26 26 0 0 1 52 0v16"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* корпус */}
      <path
        d="M46 64h108l10 104a14 14 0 0 1-14 15H50a14 14 0 0 1-14-15L46 64Z"
        fill="var(--w-bag-face, #f4f1eb)"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* горловина: тёмная полоса читается как раскрытый верх */}
      <path
        d="M46 64h108l1.6 17c-18 6-38 9-55.6 9s-37.6-3-55.6-9L46 64Z"
        fill="currentColor"
        opacity="0.14"
        stroke="none"
      />
      <path d="M44.4 81c18 6 38 9 55.6 9s37.6-3 55.6-9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* янтарная лента и лапа на боку */}
      <path d="M52 128h96" fill="none" stroke="var(--w-amber, #f59e0b)" strokeWidth="9" strokeLinecap="round" opacity="0.55" />
      <g fill="currentColor" opacity="0.55">
        <ellipse cx="100" cy="158" rx="11" ry="9" />
        <ellipse cx="85" cy="143" rx="5" ry="6.5" />
        <ellipse cx="97" cy="139" rx="5" ry="7" />
        <ellipse cx="110" cy="141" rx="5" ry="6.5" />
      </g>
    </svg>
  );
}

/**
 * Растр, если файл положили, иначе контурный рисунок.
 *
 * Обычный <img>, а не next/image: файла может ещё не быть, и оптимизатор
 * на каждую недостающую картинку писал бы ошибку в лог сборки. Здесь
 * отсутствие файла — штатное состояние, а не поломка.
 */
function RasterOrDrawing({
  srcs,
  fallback,
  className,
}: {
  srcs: string[];
  fallback: React.ReactNode;
  className?: string;
}) {
  const [tried, setTried] = useState(0);
  if (tried >= srcs.length) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcs[tried]}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setTried((value) => value + 1)}
    />
  );
}

/** Предмет вишлиста: фотография предмета, пока её нет — рисунок. */
export function GiftObjectArt({ title, className }: { title: string; className?: string }) {
  const slug = objectSlug(title);
  const paper = ["wet-food", "dry-food", "litter", "medicine", "bowl"].includes(slug);
  return (
    <RasterOrDrawing
      srcs={[`/wishlist/${paper ? "paper-v2/" : ""}item-${slug}.webp`]}
      fallback={<GiftObject title={title} className={className} />}
      className={className}
    />
  );
}

/**
 * Цель, в которую складываются предметы. Порядок — это порядок выбора:
 * что положат первым, то и покажется. Коробка, переноска, сумка.
 */
const DESTINATIONS = ["box", "carrier", "tote"];

export function DestinationArt({ className }: ObjectProps) {
  return (
    <RasterOrDrawing
      srcs={DESTINATIONS.map((name) => `/wishlist/destination-${name}.webp`)}
      fallback={<ToteBag className={className} />}
      className={className}
    />
  );
}
