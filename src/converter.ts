import { BS_MONTH_DAYS } from "./data";
import { validateDate } from "./utils";

export const REF_BS = { year: 1970, monthIndex: 0, day: 1 };
export const REF_AD = new Date(Date.UTC(1913, 3, 13)); // 13 Apr 1913

// Precompute cumulative days for each year from reference
const yearCumulativeDays: Map<number, number> = new Map();
let cumulativeDays = 0;

// Get the year range from BS_MONTH_DAYS
const minYear = Math.min(...Object.keys(BS_MONTH_DAYS).map(Number));
const maxYear = Math.max(...Object.keys(BS_MONTH_DAYS).map(Number));

for (let year = minYear; year <= maxYear; year++) {
  yearCumulativeDays.set(year, cumulativeDays);
  cumulativeDays += BS_MONTH_DAYS[year].reduce((a, b) => a + b, 0);
}

// Precompute cumulative days for each month within each year
const monthCumulativeDays: Map<number, number[]> = new Map();

for (let year = minYear; year <= maxYear; year++) {
  const monthDays: number[] = [0]; // Month 0 starts at day 0
  let sum = 0;
  for (let m = 0; m < 12; m++) {
    sum += BS_MONTH_DAYS[year][m];
    monthDays.push(sum);
  }
  monthCumulativeDays.set(year, monthDays);
}

/**
 * Convert BS date to AD date
 */
export function bsToAd(year: number, monthIndex: number, day: number): Date {
  validateDate(year, monthIndex, day);

  // Calculate days from reference using precomputed values
  const daysFromRefYear =
    (yearCumulativeDays.get(year) || 0) -
    (yearCumulativeDays.get(REF_BS.year) || 0);
  const daysFromMonths = (monthCumulativeDays.get(year) || [])[monthIndex] || 0;
  const totalDays = daysFromRefYear + daysFromMonths + (day - REF_BS.day);

  const ad = new Date(REF_AD);
  ad.setUTCDate(ad.getUTCDate() + totalDays);
  return ad;
}

/**
 * Convert AD date to BS date
 */
export function adToBs(ad: Date): {
  year: number;
  monthIndex: number;
  day: number;
} {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceRef = Math.round((ad.getTime() - REF_AD.getTime()) / msPerDay);

  // Binary search for the year
  let year = REF_BS.year;
  let low = minYear;
  let high = maxYear;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const daysAtYearStart =
      (yearCumulativeDays.get(mid) || 0) -
      (yearCumulativeDays.get(REF_BS.year) || 0);
    const daysInYear = BS_MONTH_DAYS[mid]?.reduce((a, b) => a + b, 0) || 0;

    if (
      daysSinceRef >= daysAtYearStart &&
      daysSinceRef < daysAtYearStart + daysInYear
    ) {
      year = mid;
      break;
    } else if (daysSinceRef < daysAtYearStart) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Calculate remaining days after accounting for complete years
  const daysIntoYear =
    daysSinceRef -
    ((yearCumulativeDays.get(year) || 0) -
      (yearCumulativeDays.get(REF_BS.year) || 0));

  // Find the month using precomputed cumulative days
  const cumDays = monthCumulativeDays.get(year) || [];
  let monthIndex = 0;

  for (let m = 0; m < 12; m++) {
    if (daysIntoYear >= cumDays[m] && daysIntoYear < cumDays[m + 1]) {
      monthIndex = m;
      break;
    }
  }

  // Calculate the day
  const day = daysIntoYear - cumDays[monthIndex] + 1;

  return { year, monthIndex, day };
}

/**
 * Get total days in a BS year
 */
export function getDaysInYear(year: number): number {
  return BS_MONTH_DAYS[year]?.reduce((a, b) => a + b, 0) || 0;
}

/**
 * Get days in a specific BS month
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return BS_MONTH_DAYS[year]?.[monthIndex] || 0;
}
