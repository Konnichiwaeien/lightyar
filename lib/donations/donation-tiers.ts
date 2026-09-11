export type DonationTierId = "food" | "care" | "diagnostics" | "treatment";
export type SerkanMood = "worried" | "cautious" | "relieved" | "trusting";

export interface DonationTier {
  id: DonationTierId;
  amount: number;
  shortLabel: string;
  description: string;
  mood: SerkanMood;
  moodLabel: string;
}

export const DONATION_TIERS = [
  {
    id: "food",
    amount: 300,
    shortLabel: "Корм",
    description: "Пополнит запас корма",
    mood: "worried",
    moodLabel: "Серкан ещё тревожится",
  },
  {
    id: "care",
    amount: 500,
    shortLabel: "Забота",
    description: "Пойдёт на обработку и базовые лекарства",
    mood: "cautious",
    moodLabel: "Серкан присматривается",
  },
  {
    id: "diagnostics",
    amount: 1000,
    shortLabel: "Диагностика",
    description: "Пойдёт на осмотр и анализы",
    mood: "relieved",
    moodLabel: "Серкан заметно расслабился",
  },
  {
    id: "treatment",
    amount: 3000,
    shortLabel: "Лечение",
    description: "Поможет оплатить лечение",
    mood: "trusting",
    moodLabel: "Серкан чувствует поддержку",
  },
] as const satisfies readonly DonationTier[];
