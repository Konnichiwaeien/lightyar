"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, ShieldAlert } from "lucide-react";

interface Props {
  campaignId: string;
  onSuccess?: (amount: number) => void;
}

const TIERS = ["200", "500", "1000", "2000"] as const;

const INPUT_CLASS =
  "w-full bg-[#faf8f5] border-2 border-stone-100 text-[#1c1c1c] placeholder:text-[#b5ae9e] font-sans font-medium text-[15px] rounded-2xl py-4 px-6 focus:outline-hidden focus:border-[#f59e0b] transition-all duration-200";

export function CampaignInteractiveWidget(props: Props) {
  const [donationType, setDonationType] = useState<"once" | "monthly">("once");
  const [donationAmount, setDonationAmount] = useState("500");
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <div
      id="donation-form"
      data-campaign-id={props.campaignId}
      className="bg-white rounded-[2rem] p-8 md:p-10 border border-stone-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] pointer-events-auto w-full"
    >
      <h3 className="text-2xl font-black tracking-tight text-[#d97706] text-center mb-8 uppercase font-sans">
        Поддержать сбор
      </h3>

      <fieldset className="border-0 p-0 m-0">
        <legend className="sr-only">Периодичность помощи</legend>
        <div className="relative flex bg-stone-100 p-1.5 rounded-[1.25rem] mb-8 border border-stone-200/30">
          {(["once", "monthly"] as const).map((type) => (
            <label
              key={type}
              className="relative z-10 flex-1 py-4 text-center text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer font-sans transition-colors duration-200"
              style={{ color: donationType === type ? "#d97706" : "#8c857b" }}
            >
              <input
                className="sr-only"
                type="radio"
                name="campaign-donation-type"
                value={type}
                checked={donationType === type}
                onChange={() => setDonationType(type)}
              />
              {donationType === type && (
                <motion.span
                  layoutId="donation-type-indicator"
                  className="absolute inset-0 rounded-xl bg-[#fdf0e9] border border-[#f59e0b]/15 shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{type === "once" ? "Разово" : "Ежемесячно"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0 m-0">
        <legend className="sr-only">Сумма помощи</legend>
        <div className="grid grid-cols-2 gap-3">
          {TIERS.map((amount) => {
            const active = donationAmount === amount;
            return (
              <label
                key={amount}
                className={`relative py-4.5 rounded-2xl border-2 text-center font-sans text-xl font-black transition-colors duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-[#f59e0b] ${
                  active
                    ? "border-[#f59e0b] bg-[#f59e0b] text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
                    : "border-stone-100 bg-[#fbf9f4]/50 text-stone-700 hover:border-stone-200"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="campaign-donation-amount"
                  value={amount}
                  checked={active}
                  onChange={() => setDonationAmount(amount)}
                />
                {amount} ₽
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor={`custom-amount-${props.campaignId}`} className="text-[10px] font-bold uppercase tracking-widest text-[#8c857b] ml-1 font-sans">
          Другая сумма
        </label>
        <div className="relative">
          <Pencil className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c857b]" size={16} aria-hidden="true" />
          <input
            type="number"
            id={`custom-amount-${props.campaignId}`}
            inputMode="numeric"
            min="50"
            step="50"
            placeholder="Введите сумму"
            value={TIERS.some((amount) => amount === donationAmount) ? "" : donationAmount}
            onChange={(event) => {
              if (event.target.value) setDonationAmount(event.target.value);
            }}
            className={`${INPUT_CLASS} !pl-13 !pr-12`}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#d97706] font-sans text-base font-bold">₽</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {!isAnonymous && (
          <label className="sr-only" htmlFor={`campaign-name-${props.campaignId}`}>
            Ваше имя
          </label>
        )}
        {!isAnonymous && (
          <input id={`campaign-name-${props.campaignId}`} type="text" autoComplete="name" placeholder="Ваше имя" className={INPUT_CLASS} />
        )}
        <label className="sr-only" htmlFor={`campaign-email-${props.campaignId}`}>Email для будущей квитанции</label>
        <input id={`campaign-email-${props.campaignId}`} type="email" autoComplete="email" inputMode="email" placeholder="Email для будущей квитанции" className={INPUT_CLASS} />

        <label className="flex items-center gap-3 ml-1 mt-1 cursor-pointer select-none" htmlFor={`anon-check-${props.campaignId}`}>
          <input
            type="checkbox"
            id={`anon-check-${props.campaignId}`}
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="h-5 w-5 accent-[#f59e0b]"
          />
          <span className="text-sm text-stone-500 font-semibold font-sans">Анонимная помощь</span>
        </label>
      </div>

      <button
        type="button"
        aria-disabled="true"
        className="mt-8 w-full rounded-2xl py-5 font-sans font-black uppercase tracking-widest text-xs md:text-sm flex flex-col items-center justify-center gap-1 bg-stone-200 text-stone-500 cursor-not-allowed"
      >
        <span>{donationType === "monthly" ? "Подписка на помощь" : `Поддержать на ${Number(donationAmount || 0).toLocaleString("ru-RU")} ₽`}</span>
        <small className="text-[9px] tracking-[0.14em]">Онлайн-оплата подключается</small>
      </button>

      <div className="mt-4 flex items-start justify-center gap-2 text-[10px] text-stone-400 leading-relaxed font-sans">
        <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>Данные никуда не отправляются, пока не подключён платёжный провайдер.</span>
      </div>
    </div>
  );
}
