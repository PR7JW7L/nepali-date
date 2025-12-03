import { adToBs, bsToAd } from "./converter";
import { validateDate } from "./utils";
import {
  CALENDARS,
  FORMAT_TOKENS,
  formatDateAD,
  formatDateBS,
  type FormatString,
  LOCALES,
} from "./formatter";

/**
 * NepaliDate represents a BS (Bikram Sambat) date.
 * monthIndex is 0-based (0 = Baishakh, 11 = Chaitra)
 */
export class NepaliDate {
  constructor(
    public year: number,
    public monthIndex: number, // 0–11
    public day: number,
  ) {
    validateDate(year, monthIndex, day);
  }

  // ---------------- Static Constructors ----------------

  /** Create from BS values */
  static fromBS(year: number, monthIndex: number, day: number): NepaliDate {
    return new NepaliDate(year, monthIndex, day);
  }

  /** Create from Gregorian Date */
  static fromAD(date: Date): NepaliDate {
    const { year, monthIndex, day } = adToBs(date);
    return new NepaliDate(year, monthIndex, day);
  }

  // ---------------- Conversion ----------------

  /** Convert to JS Date */
  toAD(): Date {
    return bsToAd(this.year, this.monthIndex, this.day);
  }

  // ---------------- Arithmetic ----------------

  /** Add n days, returns a new NepaliDate */
  addDays(n: number): NepaliDate {
    const ad = this.toAD();
    ad.setUTCDate(ad.getUTCDate() + n);
    return NepaliDate.fromAD(ad);
  }

  /** Subtract n days, returns a new NepaliDate */
  subtractDays(n: number): NepaliDate {
    return this.addDays(-n);
  }

  /** Difference in days (this - other) */
  diffDays(other: NepaliDate): number {
    return Math.floor(
      (this.toAD().getTime() - other.toAD().getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  // ---------------- Comparison ----------------

  before(other: NepaliDate): boolean {
    return this.toAD() < other.toAD();
  }

  after(other: NepaliDate): boolean {
    return this.toAD() > other.toAD();
  }

  equals(other: NepaliDate): boolean {
    return (
      this.year === other.year &&
      this.monthIndex === other.monthIndex &&
      this.day === other.day
    );
  }

  // ---------------- Formatting ----------------
  format(options?: {
    format?: FormatString;
    calendar?: (typeof CALENDARS)[number];
    locale?: (typeof LOCALES)[number];
  }): string {
    const {
      format = "YYYY-MM-DD",
      calendar = "BS",
      locale = "en",
    } = options ?? {};
    if (calendar === "BS") return formatDateBS(this, format, locale);
    return formatDateAD(this.toAD(), format, locale);
  }

  /** Optional helper to show all tokens */
  static getFormatTokens(): Record<string, string> {
    return FORMAT_TOKENS;
  }

  // ---------------- Utilities ----------------

  clone(): NepaliDate {
    return new NepaliDate(this.year, this.monthIndex, this.day);
  }
}
