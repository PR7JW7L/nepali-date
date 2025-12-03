import { BS_MONTH_DAYS } from "./data";
import { validateDate } from "./utils";

export const REF_BS = { year: 1970, monthIndex: 0, day: 1 };
export const REF_AD = new Date(Date.UTC(1913, 3, 13)); // 13 Apr 1913

export function bsToAd(year: number, monthIndex: number, day: number): Date {
  validateDate(year, monthIndex, day);

  let totalDays = 0;
  for (let y = REF_BS.year; y < year; y++) {
    totalDays += BS_MONTH_DAYS[y].reduce((a, b) => a + b, 0);
  }
  for (let m = 0; m < monthIndex; m++) {
    totalDays += BS_MONTH_DAYS[year][m];
  }
  totalDays += day - REF_BS.day;

  const ad = new Date(REF_AD);
  ad.setUTCDate(ad.getUTCDate() + totalDays);
  return ad;
}

export function adToBs(ad: Date): {
  year: number;
  monthIndex: number;
  day: number;
} {
  let diff = Math.floor(
    (ad.getTime() - REF_AD.getTime()) / (1000 * 60 * 60 * 24),
  );
  let year = REF_BS.year;
  let monthIndex = REF_BS.monthIndex;
  let day = REF_BS.day;

  while (diff !== 0) {
    if (diff > 0) {
      day++;
      if (day > BS_MONTH_DAYS[year][monthIndex]) {
        day = 1;
        monthIndex++;
        if (monthIndex > 11) {
          monthIndex = 0;
          year++;
        }
      }
      diff--;
    } else {
      day--;
      if (day < 1) {
        monthIndex--;
        if (monthIndex < 0) {
          monthIndex = 11;
          year--;
        }
        day = BS_MONTH_DAYS[year][monthIndex];
      }
      diff++;
    }
  }

  return { year, monthIndex, day };
}
