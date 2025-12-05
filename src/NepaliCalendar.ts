import { NepaliDate } from "./NepaliDate";
import {
  BS_MONTH_DAYS,
  CALENDAR_YEARS,
  MAX_YEAR_BS,
  MIN_YEAR_BS,
} from "./data";
import { BS_MONTHS_WITH_AD, formatNumber } from "./formatter";

export interface MonthDay {
  ad: number;
  en: number;
  np: string;
  date: NepaliDate;
}

export interface MonthData {
  month: {
    en: string;
    np: string;
    ad: string;
  };
  days: (MonthDay | null)[];
}

export class NepaliCalendar {
  year: number;
  private monthCache: Record<number, MonthData> = {};

  constructor(year: number) {
    if (!BS_MONTH_DAYS[year]) {
      throw new Error(
        `Year ${year} out of range (${MIN_YEAR_BS}-${MAX_YEAR_BS})`,
      );
    }
    this.year = year;
  }

  /** Get month data (0-11 for zero-indexed months) */
  getMonth(monthIndex: number): MonthData {
    if (monthIndex < 0 || monthIndex > 11) {
      throw new Error(`Invalid month index: ${monthIndex} (expected 0-11)`);
    }

    // Return cached
    if (this.monthCache[monthIndex]) {
      return this.monthCache[monthIndex];
    }

    const daysInMonth = BS_MONTH_DAYS[this.year][monthIndex];
    const firstDate = new NepaliDate(this.year, monthIndex, 1);
    const firstDayAD = firstDate.toAD().getDay(); // 0=Sunday, 6=Saturday

    const days: (MonthDay | null)[] = [];

    // Padding for the first week
    for (let i = 0; i < firstDayAD; i++) {
      days.push(null);
    }

    // Fill month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new NepaliDate(this.year, monthIndex, d);
      const adDate = date.toAD();

      days.push({
        en: d,
        ad: adDate.getDate(),
        np: formatNumber(d, "ne"),
        date,
      });
    }

    const monthData: MonthData = {
      month: BS_MONTHS_WITH_AD[monthIndex],
      days,
    };

    this.monthCache[monthIndex] = monthData;
    return monthData;
  }

  /** Get all months for the year */
  getAllMonths(): MonthData[] {
    return Array.from({ length: 12 }, (_, i) => this.getMonth(i));
  }

  /** Get AD year for a given month */
  getMonthAdYear(monthIndex: number): number {
    const monthData = this.getMonth(monthIndex);
    const firstDay = monthData.days.find((d) => d !== null);
    return firstDay ? firstDay.date.toAD().getFullYear() : this.year;
  }

  /** Get the current month (for today's date) */
  getCurrentMonth(): MonthData | null {
    const today = NepaliDate.fromAD();
    if (today.year === this.year) {
      return this.getMonth(today.monthIndex);
    }
    return null;
  }

  /** Check if this calendar year is the current year */
  isCurrentYear(): boolean {
    const today = NepaliDate.fromAD();
    return today.year === this.year;
  }

  /** Get next year's calendar */
  nextYear(): NepaliCalendar {
    if (this.year >= MAX_YEAR_BS) {
      throw new Error(`Cannot go beyond year ${MAX_YEAR_BS}`);
    }
    return new NepaliCalendar(this.year + 1);
  }

  /** Get previous year calendar */
  prevYear(): NepaliCalendar {
    if (this.year <= MIN_YEAR_BS) {
      throw new Error(`Cannot go before year ${MIN_YEAR_BS}`);
    }
    return new NepaliCalendar(this.year - 1);
  }

  /** Check if you can go to next year */
  canGoNext(): boolean {
    return this.year < MAX_YEAR_BS;
  }

  /** Check if you can go to the previous year */
  canGoPrev(): boolean {
    return this.year > MIN_YEAR_BS;
  }

  /** Clear month cache (useful if data changes) */
  clearCache(): void {
    this.monthCache = {};
  }

  /** Static properties for year constraints */
  static minYear = MIN_YEAR_BS;
  static maxYear = MAX_YEAR_BS;
  static years = CALENDAR_YEARS;

  /** Create calendar for current BS year */
  static current(): NepaliCalendar {
    const today = NepaliDate.fromAD();
    return new NepaliCalendar(today.year);
  }

  /** Create a calendar for a specific date */
  static fromDate(date: NepaliDate): NepaliCalendar {
    return new NepaliCalendar(date.year);
  }
}
