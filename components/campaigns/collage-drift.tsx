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
 * Отсчёт бывает двух видов. У обложки слой стоит на месте при нулевой
 * прокрутке и уезжает по мере ухода секции: `origin="start"`. У секций в
 * середине страницы слой стоит на месте, когда секция в центре экрана, и
 * сдвинут по обе стороны от него: `origin="center"`. Без этого обложка при
 * загрузке была бы уже наполовину сдвинута.
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
  rotate = 0,
  origin = "center",
  progress,
  still,
  style,
  children,
  small,
}: {
  className: string;
  /** Полный путь слоя по вертикали в пикселях. Отрицательный: слой уезжает вверх. */
  distance: number;
  /** Полный поворот слоя за путь, в градусах. */
  rotate?: number;
  origin?: "start" | "center";
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Мелкий слой: на узком экране такие снимаются, чтобы поле не стало кашей. */
  small?: boolean;
}) {
  const at = (value: number) => (origin === "start" ? value : value - 0.5);
  const y = useTransform(progress, (value) => at(value) * distance);
  const turn = useTransform(progress, (value) => at(value) * rotate);
  return (
    <motion.div
      className={className}
      data-small={small ? "true" : undefined}
      style={still ? style : { ...style, y, rotate: turn }}
    >
      {children}
    </motion.div>
  );
}
