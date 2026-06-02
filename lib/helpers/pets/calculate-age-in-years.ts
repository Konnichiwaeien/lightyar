/**
 * Calculates a pet's age in decimal years based on its birth date.
 * If birth date is missing, returns a default fallback of 2.0.
 *
 * @param birthDate ISO date string or similar parseable date string
 * @returns number of decimal years, minimum 0.1
 */
export function calculateAgeInYears(birthDate?: string): number {
  if (!birthDate) return 2.0; // Default fallback
  const birth = new Date(birthDate);
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return Math.max(0.1, totalMonths / 12);
}
