"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, HeartPulse, Sparkles, ShieldCheck, Cookie, Stethoscope, HeartHandshake } from "lucide-react";
import { z } from "zod";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const RECENT_DONATIONS = Array.from({ length: 20 }).map((_, i) => ({
  name: ["Мария О.", "Алексей", "Анонимный друг", "Елена", "Михаил", "Анна С.", "Дмитрий", "Ольга"][i % 8],
  amount: [500, 1000, 300, 1500, 200, 5000, 100, 800][i % 8],
  type: (["monthly", "once", "monthly", "once", "once", "monthly", "once", "monthly"] as const)[i % 8],
  avatarBg: ["bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700"][i % 4],
}));

const TIERS = [
  { amount: "300", icon: Cookie, label: "Кормилец", desc: "Сытый день для одного подопечного — сухой корм и витамины", color: "text-amber-500" },
  { amount: "500", icon: Stethoscope, label: "Защитник", desc: "Осмотр ветеринара, базовые анализы и обработка от паразитов", color: "text-rose-500" },
  { amount: "1000", icon: HeartHandshake, label: "Ангел-хранитель", desc: "Полный курс вакцинации и стерилизация одного животного", color: "text-emerald-500" },
];

const donationSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
});

const TABS = ["monthly", "once"] as const;
const TAB_LABELS = { monthly: "Ежемесячно", once: "Разово" } as const;

const inputBase = "w-full bg-white border-2 rounded-2xl px-6 md:px-8 py-5 text-stone-900 focus:outline-none placeholder:text-stone-400 transition-all duration-300 focus:border-amber-400 focus:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.1)]";

export function PaymentSection({ textEnter, textLeave }: Props) {
  const [donationType, setDonationType] = useState<(typeof TABS)[number]>("monthly");
  const [donationAmount, setDonationAmount] = useState("500");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const selectedTier = TIERS.find((t) => t.amount === donationAmount);

  const handleSubmit = () => {
    if (isAnonymous) {
      const result = donationSchema.shape.email.safeParse(formData.email);
      if (!result.success) {
        setErrors({ email: result.error.issues[0].message });
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
    alert(`CloudPayments: ${donationAmount} ₽, ${donationType}`);
  };

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#e8e4dc] relative overflow-hidden flex flex-col" id="donate">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 20px; }
      `}</style>

      <div className="absolute top-[-10%] left-1/4 w-[40vw] h-[40vw] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[30vw] h-[30vw] bg-rose-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-12 lg:gap-16 w-full">

        {/* Header: title left, description right */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-end pt-8">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-stone-200/60 mb-8 shadow-sm cursor-none pointer-events-auto hover:bg-white transition-colors">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">На счету каждый рубль</span>
            </div>
            <h2
              className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-bold tracking-tighter text-stone-900 drop-shadow-sm"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Без вас не <span className="italic font-serif text-amber-600">справимся.</span>
            </h2>
          </div>
          <div className="md:w-1/2 md:pb-2">
            <p className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-lg">
              Регулярный платёж — самая ценная помощь. Он позволяет планировать лечение, закупать корм и не зависеть от случая.
            </p>
          </div>
        </div>

        {/* Unified white card */}
        <div className="relative bg-white border border-stone-200 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.05)] z-20 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch">

            {/* Left: Donation Form */}
            <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-14 flex flex-col cursor-auto">

              {/* Toggle with sliding indicator */}
              <div className="relative flex p-2 bg-stone-100/60 rounded-3xl mb-10 border border-stone-200/50">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDonationType(tab)}
                    className={`flex-1 relative z-10 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-500 rounded-2xl cursor-pointer ${
                      donationType === tab ? "text-white" : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
                <motion.div
                  className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-amber-500 rounded-2xl"
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ left: donationType === "monthly" ? 8 : "calc(50%)" }}
                />
              </div>

              {/* Tier selectors */}
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 block ml-1">Выберите тир поддержки</label>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {TIERS.map((tier) => {
                    const Icon = tier.icon;
                    const active = donationAmount === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        onClick={() => setDonationAmount(tier.amount)}
                        className={`flex flex-col items-center justify-center py-6 md:py-8 rounded-2xl transition-all duration-300 border-2 cursor-pointer group ${
                          active
                          ? "border-amber-400 bg-amber-50/50 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)] -translate-y-1"
                          : "border-stone-100 bg-white hover:border-amber-200 hover:-translate-y-1 hover:shadow-md hover:shadow-stone-200/50"
                        }`}
                      >
                        <Icon size={20} className={`mb-2 ${tier.color}`} />
                        <span className={`text-2xl md:text-3xl font-serif font-bold transition-colors ${active ? "text-amber-700" : "text-stone-700 group-hover:text-amber-600"}`}>{tier.amount}</span>
                        <span className={`text-[10px] font-bold uppercase mt-1 md:mt-2 transition-colors ${active ? "text-amber-500" : "text-stone-300 group-hover:text-amber-400"}`}>рублей</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tier description */}
              <AnimatePresence mode="wait">
                {selectedTier && (
                  <motion.div
                    key={selectedTier.amount}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 px-5 py-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 mb-6"
                  >
                    <selectedTier.icon size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{selectedTier.label}</span>
                      <span className="text-xs text-amber-600/80 ml-1.5">— {selectedTier.desc}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom amount */}
              <div className="group relative mb-4">
                <input
                  type="number"
                  placeholder="Другая сумма"
                  onChange={(e) => { if (e.target.value) setDonationAmount(e.target.value); }}
                  className={`${inputBase} border-stone-100 text-xl font-serif placeholder:text-stone-300`}
                />
                <span className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-lg font-serif text-amber-400 group-focus-within:text-amber-600 transition-colors">₽</span>
              </div>

              {/* Name + Email + Anonymous */}
              <div className="flex flex-col gap-4">
                {!isAnonymous && (
                  <div>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })); }}
                      className={`${inputBase} ${errors.name ? "border-red-300" : "border-stone-100"}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-2">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    placeholder="Email для квитанции"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors((p) => ({ ...p, email: undefined })); }}
                    className={`${inputBase} ${errors.email ? "border-red-300" : "border-stone-100"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-2">{errors.email}</p>}
                </div>
                <label className="flex items-center gap-3 ml-1 mt-1 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-lg border-2 border-stone-200 peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all flex items-center justify-center">
                      {isAnonymous && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-stone-500">Анонимное пожертвование</span>
                </label>
              </div>

              {/* Submit — gradient hover */}
              <button
                onClick={handleSubmit}
                className="mt-10 relative w-full overflow-hidden bg-stone-900 text-white rounded-2xl h-16 md:h-[72px] font-bold uppercase tracking-widest text-xs md:text-sm cursor-pointer group transition-transform duration-300 hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]"
              >
                <span className="relative z-10 inline-flex items-center gap-3">
                  Перевести {donationAmount} ₽
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-stone-800 via-amber-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </button>

              <div className="mt-6 flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                <ShieldCheck size={14} className="text-stone-300 mr-2" />
                Безопасный платеж
              </div>
            </div>

            {/* Right: Live Feed */}
            <div className="w-full lg:w-5/12 bg-stone-50 border-t lg:border-t-0 lg:border-l border-stone-100 flex flex-col relative">
              <div className="flex items-center justify-between px-8 pt-8 pb-4 md:px-10 md:pt-10 md:pb-5 shrink-0" onMouseEnter={textEnter} onMouseLeave={textLeave}>
                <div>
                  <h4 className="text-sm md:text-base font-bold uppercase tracking-widest text-stone-900 mb-1 flex items-center gap-3">
                    Живая лента <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  </h4>
                  <p className="text-xs font-light text-stone-400">Нас поддерживают прямо сейчас</p>
                </div>
                <HeartPulse className="text-stone-200" size={28} strokeWidth={1} />
              </div>

              <div className="overflow-y-auto max-h-[800px] px-6 pb-8 md:px-8 custom-scrollbar" onMouseEnter={textEnter} onMouseLeave={textLeave}>
                <div className="flex flex-col gap-2.5">
                  {RECENT_DONATIONS.map((d, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-none pointer-events-auto group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${d.avatarBg} flex items-center justify-center text-sm font-bold font-serif shrink-0`}>
                          {d.name[0]}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="text-sm font-semibold text-stone-900 leading-tight">{d.name}</div>
                          <div className="text-[10px] uppercase tracking-widest text-stone-400 mt-0.5 font-medium">
                            {d.type === "monthly" ? "регулярно" : "единоразово"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-serif font-extrabold text-amber-500 whitespace-nowrap">
                        +{d.amount.toLocaleString("ru-RU")} <span className="text-sm font-bold text-amber-400">₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-16 bg-linear-to-t from-stone-50 to-transparent absolute bottom-0 left-0 w-full pointer-events-none" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
