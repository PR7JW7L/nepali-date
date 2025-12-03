import { BS_MONTH_DAYS } from "./data";

/**
 * Get the number of days in a BS month
 * @param year - BS year
 * @param monthIndex - 0-based month (0 = Baishakh)
 */
export function getMonthLength(year: number, monthIndex: number): number {
  const yearData = BS_MONTH_DAYS[year];
  if (!yearData) throw new Error(`Year ${year} not found in BS_MONTH_DAYS`);
  if (monthIndex < 0 || monthIndex > 11)
    throw new Error(`Invalid monthIndex: ${monthIndex}`);
  return yearData[monthIndex];
}

/**
 * Validate a BS date
 * @param year - BS year
 * @param monthIndex - 0-based month (0 = Baishakh)
 * @param day - day of month
 */
export function validateDate(year: number, monthIndex: number, day: number) {
  if (monthIndex < 0 || monthIndex > 11)
    throw new Error(`Invalid monthIndex: ${monthIndex}`);
  const days = getMonthLength(year, monthIndex);
  if (day < 1 || day > days)
    throw new Error(`Invalid day: ${day} for ${year}-${monthIndex}`);
}
