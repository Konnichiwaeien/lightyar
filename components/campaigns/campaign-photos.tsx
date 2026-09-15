"use client";

import { useState } from "react";

import { ResilientImage } from "@/components/ui/resilient-image";

/**
 * Кадры сбора на его странице.
 *
 * Снимок здесь круг, как в каталоге и как везде на этой странице: снимок в
 * прямоугольной рамке с тенью — тот самый фотоблок, ради отказа от которого
 * переделывалась вся страница сборов. За кругом лежит плоская фигура, и это
 * та же пара «фигура за кадром», что держит поля выше и ниже.
 *
 * Остальные кадры стоят рядом малыми кругами и меняются местами с большим по
 * нажатию. Это кнопки, а не карусель: библиотека каруселей тянула бы в
 * страницу свой пакет ради пяти снимков, а переключение кнопками работает с
 * клавиатуры без единой строки обработчиков клавиш.
 *
 * Все кадры лежат в круге стопкой, виден один. Так подмена идёт растворением
 * и без второй загрузки: браузер уже держит их. Ленту это делает дороже на
 * старте, поэтому кадров берётся не больше пяти.
 */

const LIMIT = 5;

export function CampaignPhotos({ photos, title }: { photos: string[]; title: string }) {
  const list = photos.slice(0, LIMIT);
  const [shown, setShown] = useState(0);

  if (list.length === 0) return null;

  return (
    <div className="fund-shots">
      <div className="fund-shots__frame">
        <i aria-hidden="true" className="fund-shots__disc" />
        <div className="fund-shots__stack">
          {list.map((src, index) => (
            <ResilientImage
              alt={index === 0 ? title : `${title}: кадр ${index + 1}`}
              aria-hidden={index === shown ? undefined : "true"}
              className="fund-shots__img"
              data-shown={index === shown ? "true" : undefined}
              fetchPriority={index === 0 ? "high" : "low"}
              height={760}
              key={src}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 860px) 86vw, 34vw"
              src={src}
              width={760}
            />
          ))}
        </div>
      </div>

      {list.length > 1 ? (
        <div aria-label="Другие кадры сбора" className="fund-shots__rail" role="group">
          {list.map((src, index) => (
            <button
              aria-current={index === shown ? "true" : undefined}
              aria-label={`Показать кадр ${index + 1} из ${list.length}`}
              className="fund-shots__pick"
              key={src}
              onClick={() => setShown(index)}
              type="button"
            >
              <ResilientImage alt="" height={160} sizes="80px" src={src} width={160} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
