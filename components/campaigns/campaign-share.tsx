"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { campaignShareLinks } from "@/lib/campaigns/share";

/**
 * «Поделиться» на странице сбора.
 *
 * Три тихие пилюли в языке страницы: ВКонтакте, Telegram и копирование
 * ссылки. Сюда сборы приносят не поисковики, а пересланная ссылка, поэтому
 * кнопки стоят рядом с суммой, а не в подвале.
 *
 * Значки соцсетей нарисованы здесь: в наборе значков страницы их нет, а
 * подменять их буквами «ВК» — терять узнаваемость, ради которой ими и
 * делятся.
 */

export function CampaignShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const links = campaignShareLinks(url, title);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* Буфер обмена может быть запрещён (страница без защищённого соединения,
     отказ в правах). Тогда ссылка остаётся видимой в адресной строке, а
     кнопка честно не показывает «скопировано». */
  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(links.url);
      setCopyFailed(false);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <div className="fund-share" role="group" aria-label="Поделиться сбором">
      <span className="fund-share__label"><Share2 size={18} aria-hidden="true" />Поделиться сбором</span>
      <div className="fund-share__actions">

      <a aria-label="Поделиться ВКонтакте (в новой вкладке)" title="ВКонтакте" data-channel="vk" className="fund-share__btn" href={links.vk} target="_blank" rel="noopener noreferrer">
        <svg aria-hidden="true" fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
          <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.017 1.7.028 2.785.01.98-.686 1.34-1.142.587-.652-1.075-1.445-3.01-1.445-3.01A.756.756 0 0 0 6.698 8.5H3.453a.7.7 0 0 0-.622.39c-.23.444-.011.998.451 2.223l.07.145c.96 2.036 2.2 3.899 3.96 5.089C9.072 17.63 11.1 18 12.78 18h1.538c.575 0 .82-.252.82-.685v-1.428c0-.573.245-.685.425-.685.24 0 .654.096 1.617 1.007 1.104 1.104 1.285 1.6 1.906 1.6h2.96c.436 0 .652-.218.527-.648-.136-.466-.63-1.146-1.283-1.95-.354-.443-.886-1.1-1.048-1.386-.24-.372-.17-.538 0-.868 0 0 2.514-3.548 2.775-4.753.09-.42-.1-.624-.442-.624z" />
        </svg>
        <span className="sr-only">ВКонтакте</span>
      </a>

      <a aria-label="Поделиться в Telegram (в новой вкладке)" title="Telegram" data-channel="tg" className="fund-share__btn" href={links.telegram} target="_blank" rel="noopener noreferrer">
        <svg aria-hidden="true" fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <span className="sr-only">Telegram</span>
      </a>

      <button
        aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        title={copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        data-channel="link"
        data-copied={copied}
        className="fund-share__btn"
        onClick={copy}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={15} /> : <Link2 aria-hidden="true" size={15} />}
        <span className="sr-only">{copied ? "Скопировано" : "Ссылка"}</span>
      </button>
      </div>
      <span className="sr-only" role="status">{copied ? "Ссылка скопирована" : ""}</span>
      {copyFailed && <p className="fund-share__error" role="status">Не удалось скопировать. Выделите ссылку: <a href={links.url}>{links.url}</a></p>}
    </div>
  );
}
