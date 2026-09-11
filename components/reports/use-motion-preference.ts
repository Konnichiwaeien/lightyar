"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Системная настройка «уменьшить движение», безопасная для гидратации.
 *
 * На сервере настройки устройства нет, поэтому первый рендер на клиенте
 * обязан совпасть с серверным. Если читать её сразу, framer выставляет
 * разные стили на сервере и на клиенте, и React сообщает о расхождении,
 * которое «не будет исправлено». Здесь настройка вступает в силу вторым
 * рендером: движение к этому моменту ещё не началось.
 */
export function useMotionPreference(): boolean {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted && reduced === true;
}
