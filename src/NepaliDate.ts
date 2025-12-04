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
  static fromBS(year: number, monthIndex: number, day: number): NepaliDate {
    return new NepaliDate(year, monthIndex, day);
  }

  static fromAD(date: Date): NepaliDate {
    const { year, monthIndex, day } = adToBs(date);
    return new NepaliDate(year, monthIndex, day);
  }

  // ---------------- Parse ----------------
  static parse(
    value: string | number | Date | [number, number, number],
    calendar: "BS" | "AD" = "BS",
  ): NepaliDate {
    if (value instanceof NepaliDate) return value.clone();

    if (value instanceof Date) {
      return NepaliDate.fromAD(value);
    }

    if (typeof value === "number") {
      return NepaliDate.fromAD(new Date(value));
    }

    if (Array.isArray(value)) {
      const [y, m, d] = value;
      if (calendar === "BS") return NepaliDate.fromBS(y, m, d);
      const ad = new Date(y, m, d);
      return NepaliDate.fromAD(ad);
    }

    if (typeof value === "string") {
      const normalized = value.trim().replace(/\//g, "-");
      let year: number, month: number, day: number;

      // YYYY-MM-DD or YYYY-DD-MM variations
      const parts = normalized.split("-").map((v) => parseInt(v, 10));
      if (parts.length !== 3 || parts.some(isNaN)) {
        throw new Error(`Invalid date string: ${value}`);
      }

      if (calendar === "BS") {
        // detect order: year-first
        if (parts[0] > 31) {
          [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
        } else {
          // day-first
          [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
        }
        return NepaliDate.fromBS(year, month, day);
      } else {
        // AD parsing
        if (parts[0] > 31) {
          [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
        } else {
          [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
        }
        return NepaliDate.fromAD(new Date(year, month, day));
      }
    }

    throw new Error(`Unsupported value for NepaliDate.parse: ${value}`);
  }

  // ---------------- Conversion ----------------
  toAD(): Date {
    return bsToAd(this.year, this.monthIndex, this.day);
  }

  // ---------------- Arithmetic ----------------
  addDays(n: number): NepaliDate {
    const ad = this.toAD();
    ad.setDate(ad.getDate() + n);
    return NepaliDate.fromAD(ad);
  }

  subtractDays(n: number): NepaliDate {
    return this.addDays(-n);
  }

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
