"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Gift, HeartHandshake, Target, UsersRound, X } from "lucide-react";
import { getDonationTier } from "@/lib/donations/get-donation-tier";
import { DONATION_TIERS } from "@/lib/donations/donation-tiers";
import { DONATION_INTENT_EVENT, type DonationIntent } from "@/lib/donations/donation-intent";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";
import { useLenis } from "@/components/ui/smooth-scroll";
import { DonationFeed } from "./donation-feed";
import { DonationFields } from "./donation-fields";
import { DonationPet } from "./donation-pet";
import { DonationTierPicker } from "./donation-tier-picker";
import "./donation-experience.css";

export function DonationExperience({ feed }: { feed: DonationFeedState }) {
  const [activeTab, setActiveTab] = useState<"help" | "feed">("help");
  const [cadence, setCadence] = useState<"monthly" | "once">("monthly");
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const [intent, setIntent] = useState<DonationIntent | null>(null);
  const selectedTier = useMemo(() => getDonationTier(amount), [amount]);
  const helpTabRef = useRef<HTMLButtonElement>(null);
  const feedTabRef = useRef<HTMLButtonElement>(null);
  const { getLenis } = useLenis();

  useEffect(() => {
    const receiveIntent = (event: Event) => {
      const nextIntent = (event as CustomEvent<DonationIntent>).detail;
      if (!nextIntent || !Number.isFinite(nextIntent.amount) || nextIntent.amount <= 0) return;

      setIntent(nextIntent);
      setActiveTab("help");
      setCadence("once");
      setAmount(nextIntent.amount);
      setCustomAmount(DONATION_TIERS.some((tier) => tier.amount === nextIntent.amount) ? "" : String(nextIntent.amount));

      window.requestAnimationFrame(() => {
        const target = document.getElementById("donate");
        if (!target) return;
        const hasLenis = Boolean(getLenis());
        getLenis()?.scrollTo(target, { offset: -12, duration: 1.15 });
        if (!hasLenis) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    window.addEventListener(DONATION_INTENT_EVENT, receiveIntent);
    return () => window.removeEventListener(DONATION_INTENT_EVENT, receiveIntent);
  }, [getLenis]);

  const chooseTier = (nextAmount: number) => {
    setAmount(nextAmount);
    setCustomAmount("");
  };

  const changeCustomAmount = (value: string) => {
    setCustomAmount(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) setAmount(parsed);
  };

  const changeAnonymous = (nextAnonymous: boolean) => {
    setAnonymous(nextAnonymous);
    if (nextAnonymous) setConsent(false);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = activeTab === "help" ? 0 : 1;
    let nextIndex = currentIndex;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % 2 : (currentIndex + 1) % 2;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = nextIndex === 0 ? "help" : "feed";
    setActiveTab(nextTab);
    (nextTab === "help" ? helpTabRef : feedTabRef).current?.focus();
  };

  const feedCount = feed.status === "ready" ? feed.items.length : 0;

  return (
    <div className="donation-experience">
      <div className="donation-experience__panel">
        <div className="donation-tabs" role="tablist" aria-label="Раздел помощи">
          <span className="donation-tabs__indicator" data-active={activeTab} aria-hidden="true" />
          <button
            ref={helpTabRef}
            id="donation-tab-help"
            type="button"
            role="tab"
            aria-selected={activeTab === "help"}
            aria-controls="donation-panel-help"
            tabIndex={activeTab === "help" ? 0 : -1}
            onClick={() => setActiveTab("help")}
            onKeyDown={handleTabKeyDown}
          >
            <HeartHandshake size={18} strokeWidth={1.9} aria-hidden="true" />
            Помочь
          </button>
          <button
            ref={feedTabRef}
            id="donation-tab-feed"
            type="button"
            role="tab"
            aria-selected={activeTab === "feed"}
            aria-controls="donation-panel-feed"
            tabIndex={activeTab === "feed" ? 0 : -1}
            onClick={() => setActiveTab("feed")}
            onKeyDown={handleTabKeyDown}
          >
            <UsersRound size={18} strokeWidth={1.9} aria-hidden="true" />
            Помощники <span>{feedCount}</span>
          </button>
        </div>

        <DonationPet tier={selectedTier} />

        <div className="donation-tab-panels" data-active={activeTab}>
          <section
            id="donation-panel-help"
            className="donation-tab-panel donation-tab-panel--help"
            role="tabpanel"
            aria-labelledby="donation-tab-help"
            aria-hidden={activeTab !== "help"}
            data-active={activeTab === "help"}
            inert={activeTab !== "help"}
          >
            <form className="donation-experience__form" aria-label="Помочь фонду" onSubmit={(event) => event.preventDefault()}>
              <p className="donation-experience__vow">
                Ваш перевод помогает не откладывать <em>корм, анализы и лечение</em> на потом.
              </p>
              {intent ? (
                <div className="donation-intent" role="status" aria-live="polite">
                  <span className="donation-intent__icon" aria-hidden="true">
                    {intent.kind === "gift" ? <Gift size={20} /> : <Target size={20} />}
                  </span>
                  <span className="donation-intent__copy">
                    <small>{intent.kind === "gift" ? "Пожертвование на подарок" : "Пожертвование в сбор"}</small>
                    <strong>{intent.title}</strong>
                    <span>Выбрано {intent.amount.toLocaleString("ru-RU")} ₽</span>
                  </span>
                  <button type="button" onClick={() => setIntent(null)} aria-label="Убрать назначение пожертвования">
                    <X size={17} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <DonationTierPicker
                selected={selectedTier}
                customAmount={customAmount}
                onSelect={chooseTier}
                onCustomAmountChange={changeCustomAmount}
              />
              <DonationFields
                amount={amount}
                cadence={cadence}
                donorName={donorName}
                email={email}
                anonymous={anonymous}
                consent={consent}
                onCadenceChange={setCadence}
                onDonorNameChange={setDonorName}
                onEmailChange={setEmail}
                onAnonymousChange={changeAnonymous}
                onConsentChange={setConsent}
              />
            </form>
          </section>

          <section
            id="donation-panel-feed"
            className="donation-tab-panel donation-tab-panel--feed"
            role="tabpanel"
            aria-labelledby="donation-tab-feed"
            aria-hidden={activeTab !== "feed"}
            data-active={activeTab === "feed"}
            inert={activeTab !== "feed"}
          >
            <DonationFeed feed={feed} />
          </section>
        </div>
      </div>
    </div>
  );
}
