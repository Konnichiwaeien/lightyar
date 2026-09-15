"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ResilientImage } from "@/components/ui/resilient-image";

/**
 * Кадры сбора: половина первого экрана под снимок.
 *
 * Полоса уходит под правый край окна и ничем не скруглена: это разворот, а не
 * карточка. Круг, стоявший здесь сначала, держал грамматику каталога, но на
 * странице одного сбора съедал кадр: лица и обстановка уходили за кромку,
 * ради которой их и снимали.
 *
 * Кадры лежат стопкой, виден один. Так подмена идёт растворением и без второй
 * загрузки: браузер уже держит их. Ленту это делает дороже на старте, поэтому
 * кадров берётся не больше шести.
 *
 * Переключают две кнопки со счётчиком между ними. Библиотека каруселей тянула
 * бы в страницу свой пакет ради шести снимков, а кнопки работают с клавиатуры
 * без единой строки обработчиков клавиш.
 */

const LIMIT = 6;

export function CampaignPhotos({ photos, title }: { photos: string[]; title: string }) {
  const list = photos.slice(0, LIMIT);
  const [shown, setShown] = useState(0);

  if (list.length === 0) return null;

  const turn = (step: number) => setShown((now) => (now + step + list.length) % list.length);

  return (
    <div className="fund-shots">
      <i aria-hidden="true" className="fund-shots__disc" />

      <div className="fund-shots__stack">
        {list.map((src, index) => (
          <ResilientImage
            alt={index === 0 ? title : `${title}: кадр ${index + 1}`}
            aria-hidden={index === shown ? undefined : "true"}
            className="fund-shots__img"
            data-shown={index === shown ? "true" : undefined}
            fetchPriority={index === 0 ? "high" : "low"}
            height={1200}
            key={src}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="(max-width: 980px) 100vw, 48vw"
            src={src}
            width={1200}
          />
        ))}
      </div>

      {list.length > 1 ? (
        <div className="fund-shots__nav">
          <button aria-label="Предыдущий кадр" onClick={() => turn(-1)} type="button">
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          {/* Счётчик говорит вслух: без него читалка на нажатие кнопки молчит,
              картинка ведь меняется без перехода. */}
          <span aria-live="polite">
            {shown + 1} <i aria-hidden="true">/</i> {list.length}
          </span>
          <button aria-label="Следующий кадр" onClick={() => turn(1)} type="button">
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
