"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Heart, Pencil } from "lucide-react";
import { z } from "zod";
import confetti from "canvas-confetti";

interface Props {
  campaignId: string;
  onSuccess?: (amount: number) => void;
}

const TIERS = [
  { amount: "200" },
  { amount: "500" },
  { amount: "1000" },
  { amount: "2000" },
];

const donationSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  email: z.string().email("Некорректный адрес почты"),
});

/* Shared input class — every field uses the exact same font, size, padding, border */
const INPUT_CLASS =
  "w-full bg-[#faf8f5] border-2 text-[#1c1c1c] placeholder:text-[#b5ae9e] font-sans font-medium text-[15px] rounded-2xl py-4 px-6 focus:outline-hidden transition-all duration-200";
const INPUT_NORMAL = `${INPUT_CLASS} border-stone-100 hover:border-stone-200 focus:border-[#f59e0b]`;
const INPUT_ERROR = `${INPUT_CLASS} border-red-300 focus:border-red-400`;

function fireConfetti() {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const count = 200;

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      particleCount: Math.floor(count * particleRatio),
      origin: { x: 0.5, y: 0.6 },
      ...opts,
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#f59e0b", "#d97706"] });
  fire(0.2, { spread: 60, colors: ["#fbbf24", "#f59e0b"] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#f59e0b", "#fcd34d", "#d97706"] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#fbbf24"] });
  fire(0.1, { spread: 120, startVelocity: 45, colors: ["#d97706", "#f59e0b"] });
}

export function CampaignInteractiveWidget({ campaignId, onSuccess }: Props) {
  const [donationType, setDonationType] = useState<"once" | "monthly">("once");
  const [donationAmount, setDonationAmount] = useState("500");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live form validity check
  const isFormValid = (() => {
    const amt = Number(donationAmount);
    if (!amt || amt <= 0) return false;
    if (!isAnonymous && formData.name.trim().length < 2) return false;
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
    return true;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (isAnonymous) {
      const emailResult = donationSchema.shape.email.safeParse(formData.email);
      if (!emailResult.success) {
        setErrors({ email: emailResult.error.issues[0].message });
        return;
      }
      setErrors({});
    } else {
      const result = donationSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: { name?: string; email?: string } = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as "name" | "email";
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
    }

    setIsSubmitting(true);
    // Simulate API request to CloudPayments
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      fireConfetti();
      if (onSuccess) {
        onSuccess(Number(donationAmount));
      }
    }, 1800);
  };

  return (
    <div id="donation-form" className="bg-white rounded-[2rem] p-8 md:p-10 border border-stone-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] pointer-events-auto w-full">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="donation-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-black tracking-tight text-[#d97706] text-center mb-8 uppercase font-sans">
              Поддержать сбор
            </h3>

            {/* Type selector with animated sliding indicator */}
            <div className="relative flex bg-stone-100 p-1.5 rounded-[1.25rem] mb-8 border border-stone-200/30">
              {(["once", "monthly"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDonationType(type)}
                  className="relative z-10 flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer font-sans transition-colors duration-200"
                  style={{ color: donationType === type ? "#d97706" : "#8c857b" }}
                >
                  {donationType === type && (
                    <motion.div
                      layoutId="donation-type-indicator"
                      className="absolute inset-0 rounded-xl bg-[#fdf0e9] border border-[#f59e0b]/15 shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{type === "once" ? "Разово" : "Ежемесячно"}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Tiers 2x2 Grid with scale bounce */}
              <div className="grid grid-cols-2 gap-3">
                {TIERS.map((tier) => {
                  const active = donationAmount === tier.amount;
                  return (
                    <motion.button
                      key={tier.amount}
                      type="button"
                      onClick={() => setDonationAmount(tier.amount)}
                      whileTap={{ scale: 0.95 }}
                      animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                      transition={active ? { duration: 0.3 } : { duration: 0.15 }}
                      className={`py-4.5 rounded-2xl border-2 font-sans text-xl font-black transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:outline-hidden ${
                        active
                          ? "border-[#f59e0b] bg-[#f59e0b] text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
                          : "border-stone-100 bg-[#fbf9f4]/50 text-stone-700 hover:border-stone-200"
                      }`}
                    >
                      {tier.amount} ₽
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom sum input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="custom-amount" className="text-[10px] font-bold uppercase tracking-widest text-[#8c857b] ml-1 font-sans">
                  Другая сумма:
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c857b]">
                    <Pencil size={16} />
                  </div>
                  <input
                    type="number"
                    id="custom-amount"
                    placeholder="Введите сумму..."
                    value={TIERS.some((t) => t.amount === donationAmount) ? "" : donationAmount}
                    onChange={(e) => {
                      if (e.target.value) setDonationAmount(e.target.value);
                    }}
                    className={`${INPUT_NORMAL} !pl-13 !pr-12`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#d97706] font-sans text-base font-bold">₽</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {!isAnonymous && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <input
                        type="text"
                        placeholder="Ваше Имя"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setErrors({ ...errors, name: undefined });
                        }}
                        className={errors.name ? INPUT_ERROR : INPUT_NORMAL}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-2 font-sans font-semibold" role="alert">{errors.name}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <input
                    type="email"
                    placeholder="Email (для отчета)"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: undefined });
                    }}
                    className={errors.email ? INPUT_ERROR : INPUT_NORMAL}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-2 font-sans font-semibold" role="alert">{errors.email}</p>}
                </div>

                <label className="flex items-center gap-3 ml-1 mt-1 cursor-pointer select-none" htmlFor="anon-check">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="anon-check"
                      checked={isAnonymous}
                      onChange={(e) => {
                        setIsAnonymous(e.target.checked);
                        setErrors({ ...errors, name: undefined });
                      }}
                      className="sr-only peer"
                    />
                    <motion.div
                      animate={isAnonymous ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 rounded-lg border-2 border-stone-200 peer-checked:border-[#f59e0b] peer-checked:bg-[#f59e0b] flex items-center justify-center transition-all"
                    >
                      <AnimatePresence>
                        {isAnonymous && (
                          <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <span className="text-sm text-stone-500 font-semibold font-sans">Сделать платеж анонимным</span>
                </label>
              </div>

              {/* Policy agreement text */}
              <p className="text-xs text-[#8c857b] leading-[1.7] pl-1 font-sans font-medium">
                Нажимая кнопку, я принимаю условия Публичной оферты, согласен на обработку персональных данных и соглашаюсь с <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d97706] underline font-semibold font-sans">Политикой конфиденциальности</a>.
              </p>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                whileHover={isFormValid ? { scale: 1.02, y: -2 } : {}}
                whileTap={isFormValid ? { scale: 0.98 } : {}}
                className={`mt-2 w-full rounded-2xl py-5 font-sans font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer focus-visible:ring-4 focus-visible:ring-[#f59e0b] focus-visible:outline-hidden ${
                  isFormValid
                    ? "bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-[0_15px_35px_-10px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_35px_-10px_rgba(217,119,6,0.4)]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span>Обработка...</span>
                    <Loader2 size={18} className="animate-spin" />
                  </>
                ) : (
                  <span>
                    {donationType === "monthly" ? "ПОДПИСКА НА ПОМОЩЬ" : "ПОДДЕРЖАТЬ СБОР"}
                  </span>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-1 select-none font-sans">
                <ShieldCheck size={14} className="text-stone-200" />
                <span>Безопасный перевод</span>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="donation-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center py-8 px-2 flex flex-col items-center"
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 mb-6"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-500/10 mb-4 inline-block tracking-widest uppercase font-sans">
              Спасибо за помощь!
            </span>

            <h2 className="text-2xl font-sans font-black text-stone-900 leading-tight mb-4">
              {isAnonymous ? "Сбор поддержан!" : `Спасибо, ${formData.name}!`}
            </h2>

            <p className="text-sm text-stone-500 font-medium leading-relaxed max-w-xs mb-8 font-sans">
              Ваше пожертвование в размере <strong className="font-sans font-black text-[#d97706]">{Number(donationAmount).toLocaleString()} ₽</strong> успешно принято.
            </p>

            <button
              onClick={() => {
                setIsSuccess(false);
                setFormData({ name: "", email: "" });
              }}
              className="w-full bg-[#fbf9f4] hover:bg-stone-100 text-stone-600 rounded-2xl py-4.5 font-sans font-black uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
            >
              Сделать новый взнос
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
