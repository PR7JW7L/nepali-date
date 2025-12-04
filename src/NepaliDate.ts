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

export class NepaliDate {
  constructor(
    public year: number,
    public monthIndex: number,
    public day: number,
  ) {
    validateDate(year, monthIndex, day);
  }

  // -----------------------------------------------------
  //                 STATIC HELPERS
  // -----------------------------------------------------

  /** Low-level BS constructor (always expects normalized y/m/d) */
  static fromBS(
    value: NepaliDate | string | number | Date | [number, number, number],
  ): NepaliDate {
    // Normalize into a NepaliDate (BS)
    const nd = NepaliDate.parse(value, "BS");
    return new NepaliDate(nd.year, nd.monthIndex, nd.day);
  }

  /** Flexible AD → BS converter */
  static fromAD(
    value: NepaliDate | string | number | Date | [number, number, number],
  ): NepaliDate {
    let ad: Date;

    if (value instanceof Date) {
      ad = value;
    } else if (value instanceof NepaliDate) {
      ad = value.toAD();
    } else if (typeof value === "number") {
      ad = new Date(value);
    } else if (Array.isArray(value)) {
      ad = new Date(value[0], value[1], value[2]);
    } else {
      // string → parse as AD
      const parsed = NepaliDate.parse(value, "AD");
      ad = parsed.toAD();
    }

    // Convert AD → BS
    const { year, monthIndex, day } = adToBs(ad);
    return new NepaliDate(year, monthIndex, day);
  }

  // -----------------------------------------------------
  //                        PARSE
  // -----------------------------------------------------

  static parse(
    value?: NepaliDate | string | number | Date | [number, number, number],
    calendar: "BS" | "AD" = "BS",
  ): NepaliDate {
    // Already a NepaliDate
    if (value instanceof NepaliDate) return value.clone();

    // JS Date → parse as AD
    if (value instanceof Date) {
      const { year, monthIndex, day } = adToBs(value);
      return new NepaliDate(year, monthIndex, day);
    }

    // timestamp → Date → AD
    if (typeof value === "number") {
      const d = new Date(value);
      const { year, monthIndex, day } = adToBs(d);
      return new NepaliDate(year, monthIndex, day);
    }

    // Tuple input
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      if (calendar === "BS") return new NepaliDate(y, m, d);

      const { year, monthIndex, day } = adToBs(new Date(y, m, d));
      return new NepaliDate(year, monthIndex, day);
    }

    // String parsing
    if (typeof value === "string") {
      const normalized = value.trim().replace(/\//g, "-");
      const parts = normalized.split("-").map((v) => parseInt(v, 10));

      if (parts.length !== 3 || parts.some(isNaN)) {
        throw new Error(`Invalid date string: ${value}`);
      }

      const isYearFirst = parts[0] > 31;
      let year: number, month: number, day: number;

      if (isYearFirst) {
        [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
      } else {
        [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
      }

      if (calendar === "BS") {
        return new NepaliDate(year, month, day);
      }

      // AD → BS
      const {
        year: y2,
        monthIndex: m2,
        day: d2,
      } = adToBs(new Date(year, month, day));
      return new NepaliDate(y2, m2, d2);
    }

    throw new Error(`Unsupported value for NepaliDate.parse: ${value}`);
  }

  // -----------------------------------------------------
  //                   CONVERSION
  // -----------------------------------------------------

  toAD(): Date {
    return bsToAd(this.year, this.monthIndex, this.day);
  }

  // -----------------------------------------------------
  //                   ARITHMETIC
  // -----------------------------------------------------

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

  // -----------------------------------------------------
  //                 COMPARISON
  // -----------------------------------------------------

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

  // -----------------------------------------------------
  //                    FORMATTING
  // -----------------------------------------------------

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

    if (calendar === "BS") {
      return formatDateBS(this, format, locale);
    }

    return formatDateAD(this.toAD(), format, locale);
  }

  static getFormatTokens(): Record<string, string> {
    return FORMAT_TOKENS;
  }

  // -----------------------------------------------------
  //                    UTILITIES
  // -----------------------------------------------------

  clone(): NepaliDate {
    return new NepaliDate(this.year, this.monthIndex, this.day);
  }
}
