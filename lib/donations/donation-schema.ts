import { z } from "zod";

export const MIN_DONATION_AMOUNT = 50;
const rubles = z.number({ error: "Укажите сумму цифрами" })
  .int("Укажите сумму в целых рублях")
  .min(MIN_DONATION_AMOUNT, "Минимальная сумма — 50 ₽")
  .max(Number.MAX_SAFE_INTEGER, "Сумма слишком большая");

export const donationAmountSchema = z.union([
  rubles,
  z.string().trim().min(1, "Укажите сумму")
    .regex(/^\d+$/, "Укажите сумму в целых рублях")
    .transform(Number).pipe(rubles),
], { error: "Укажите сумму в целых рублях от 50 ₽" });

const common = { amount: donationAmountSchema, cadence: z.enum(["once", "monthly"]) };

// Hidden personal fields are stripped from an anonymous donation's output.
export const donationSchema = z.discriminatedUnion("anonymous", [
  z.object({ ...common, anonymous: z.literal(true) }),
  z.object({
    ...common,
    anonymous: z.literal(false),
    donorName: z.string().trim().min(1, "Укажите ваше имя").max(100, "Имя должно быть не длиннее 100 символов"),
    email: z.string().trim().min(1, "Укажите почту для чека").max(254, "Проверьте длину адреса почты")
      .pipe(z.email({ error: "Проверьте адрес почты, например mail@example.ru" })),
    consent: z.literal(true, { error: "Подтвердите согласие на обработку персональных данных" }),
  }),
]);

export type DonationValidationField = "amount" | "donorName" | "email" | "consent";
export type DonationValidationErrors = Partial<Record<DonationValidationField, string>>;

export function donationErrors(value: unknown): DonationValidationErrors {
  const result = donationSchema.safeParse(value);
  if (result.success) return {};
  const errors: DonationValidationErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "amount" || field === "donorName" || field === "email" || field === "consent") {
      errors[field] ??= issue.message;
    }
  }
  return errors;
}
