"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Слой коллажа, который плывёт по прокрутке.
 *
 * Чем ближе предмет к читателю, тем дальше он уезжает. Смещение своё у каждого
 * слоя, поэтому поле не едет целиком и коллаж не превращается в одну картинку,
 * которую подвинули. Это единственное, что отличает коллаж от наклейки, и
 * контракт проверяет разницу скоростей отдельно.
 *
 * Преобразование функцией, а не парой отрезков. От пары отрезков framer отдаёт
 * значение браузеру нативной шкалой прокрутки и для узких окон внутри пути
 * считает его неверно: библиотека пишет в инлайновый стиль ноль, а на экране
 * стоит другое число, потому что ускоренная анимация перебивает свой же стиль.
 * Это стоило одного полного переписывания секции.
 */
export function Drift({
  className,
  distance,
  progress,
  still,
  style,
  children,
  small,
}: {
  className: string;
  distance: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Мелкий слой: на узком экране такие снимаются, чтобы поле не стало кашей. */
  small?: boolean;
}) {
  const y = useTransform(progress, (value) => (value - 0.5) * distance);
  return (
    <motion.div className={className} data-small={small ? "true" : undefined} style={still ? style : { ...style, y }}>
      {children}
    </motion.div>
  );
}
