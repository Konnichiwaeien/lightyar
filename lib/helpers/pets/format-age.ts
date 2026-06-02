/**
 * Formats a decimal age number into a readable Russian string with proper pluralization.
 *
 * @param age Pet's age in decimal years
 * @returns readable string (e.g. "2 года", "5 месяцев", "Совсем кроха")
 */
export function formatAge(age: number): string {
  if (age < 0.1) return "Совсем кроха";
  if (age < 1) {
    const months = Math.round(age * 12);
    const suffix = months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев";
    return `${months} ${suffix}`;
  }
  const years = Math.floor(age);
  const suffix = years === 1 ? "год" : years < 5 ? "года" : "лет";
  return `${years} ${suffix}`;
}
