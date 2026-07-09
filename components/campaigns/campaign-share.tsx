"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  title: string;
  campaignId: string;
}

export function CampaignShare({ title, campaignId }: Props) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const handleVkShare = useCallback(() => {
    const url = getUrl();
    window.open(
      `https://vk.com/share.php?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  const handleTelegramShare = useCallback(() => {
    const url = getUrl();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [title]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = getUrl();
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const buttonClass =
    "inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-stone-200/60 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold text-[#1c1c1c]/60 transition-all duration-200 hover:border-[#f59e0b]/40 hover:text-[#1c1c1c]/80 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* VK Share */}
      <button
        type="button"
        onClick={handleVkShare}
        aria-label="Поделиться ВКонтакте"
        className={buttonClass}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.017 1.7.028 2.785.01.98-.686 1.34-1.142.587-.652-1.075-1.445-3.01-1.445-3.01A.756.756 0 0 0 6.698 8.5H3.453a.7.7 0 0 0-.622.39c-.23.444-.011.998.451 2.223l.07.145c.96 2.036 2.2 3.899 3.96 5.089C9.072 17.63 11.1 18 12.78 18h1.538c.575 0 .82-.252.82-.685v-1.428c0-.573.245-.685.425-.685.24 0 .654.096 1.617 1.007 1.104 1.104 1.285 1.6 1.906 1.6h2.96c.436 0 .652-.218.527-.648-.136-.466-.63-1.146-1.283-1.95-.354-.443-.886-1.1-1.048-1.386-.24-.372-.17-.538 0-.868 0 0 2.514-3.548 2.775-4.753.09-.42-.1-.624-.442-.624z" />
        </svg>
        <span>VK</span>
      </button>

      {/* Telegram Share */}
      <button
        type="button"
        onClick={handleTelegramShare}
        aria-label="Поделиться в Telegram"
        className={buttonClass}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <span>TG</span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        className={buttonClass}
      >
        {copied ? (
          <Check size={12} strokeWidth={2.5} className="text-emerald-500" />
        ) : (
          <Copy size={12} strokeWidth={2} />
        )}
        <span>{copied ? "Скопировано!" : "Ссылка"}</span>
      </button>
    </div>
  );
}
