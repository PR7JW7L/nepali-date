import { adToBs, bsToAd } from "./converter";
import { validateDate } from "./utils";
import {
  CALENDARS,
  FORMAT_TOKENS,
  formatDateAD,
  formatDateBS,
  type FormatString,
} from "./formatter";

type DateArg =
  | NepaliDate
  | string
  | number
  | Date
  | [number, number, number]
  | undefined
  | null;

export class NepaliDate {
  public year: number;
  public monthIndex: number;
  public day: number;

  constructor(year?: number, monthIndex?: number, day?: number) {
    if (year == null || monthIndex == null || day == null) {
      const today = new Date();
      const bs = adToBs(today);
      this.year = bs.year;
      this.monthIndex = bs.monthIndex;
      this.day = bs.day;
    } else {
      validateDate(year, monthIndex, day);
      this.year = year;
      this.monthIndex = monthIndex;
      this.day = day;
    }
  }

  // ---------------- STATIC HELPERS ----------------

  static fromBS(value?: DateArg): NepaliDate {
    if (!value) {
      const today = new Date();
      const bs = adToBs(today);
      return new NepaliDate(bs.year, bs.monthIndex, bs.day);
    }
    const nd = NepaliDate.parse(value, "BS");
    return new NepaliDate(nd.year, nd.monthIndex, nd.day);
  }

  static fromAD(value?: DateArg): NepaliDate {
    let ad: Date;

    if (!value) {
      ad = new Date();
    } else if (value instanceof Date) {
      ad = value;
    } else if (value instanceof NepaliDate) {
      ad = value.toAD();
    } else if (typeof value === "number") {
      ad = new Date(value);
    } else if (Array.isArray(value)) {
      ad = new Date(value[0], value[1], value[2]);
    } else {
      const parsed = NepaliDate.parse(value, "AD");
      ad = parsed.toAD();
    }

    const { year, monthIndex, day } = adToBs(ad);
    return new NepaliDate(year, monthIndex, day);
  }

  // ---------------- PARSE ----------------

  static parse(value?: DateArg, calendar: "BS" | "AD" = "BS"): NepaliDate {
    if (!value) return NepaliDate.fromBS();

    if (value instanceof NepaliDate) return value.clone();
    if (value instanceof Date) {
      const { year, monthIndex, day } = adToBs(value);
      return new NepaliDate(year, monthIndex, day);
    }
    if (typeof value === "number") {
      const d = new Date(value);
      const { year, monthIndex, day } = adToBs(d);
      return new NepaliDate(year, monthIndex, day);
    }
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      if (calendar === "BS") return new NepaliDate(y, m, d);
      const { year, monthIndex, day } = adToBs(new Date(y, m, d));
      return new NepaliDate(year, monthIndex, day);
    }
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

      if (calendar === "BS") return new NepaliDate(year, month, day);
      const {
        year: y2,
        monthIndex: m2,
        day: d2,
      } = adToBs(new Date(Date.UTC(year, month, day)));
      return new NepaliDate(y2, m2, d2);
    }

    throw new Error(`Unsupported value for NepaliDate.parse: ${value}`);
  }

  // ---------------- CONVERSION ----------------

  toAD(): Date {
    return bsToAd(this.year!, this.monthIndex!, this.day!);
  }

  // ---------------- ARITHMETIC ----------------

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

  // ---------------- COMPARISON ----------------

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

  // ---------------- FORMATTING ----------------

  format(options?: {
    format?: FormatString;
    calendar?: (typeof CALENDARS)[number];
  }): string {
    const { format = "YYYY-MM-DD", calendar = "BS" } = options ?? {};

    if (calendar === "BS") return formatDateBS(this, format);
    return formatDateAD(this.toAD(), format);
  }

  static getFormatTokens(): Record<string, string> {
    return FORMAT_TOKENS;
  }

  // ---------------- UTILITIES ----------------

  clone(): NepaliDate {
    return new NepaliDate(this.year, this.monthIndex, this.day);
  }
}
