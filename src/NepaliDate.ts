import { adToBs, bsToAd } from "./converter";
import { validateDate } from "./utils";
import {
  CALENDARS,
  FORMAT_TOKENS,
  formatDateAD,
  formatDateBS,
  type FormatString,
  LOCALE,
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
  public hour: number = 0;
  public minute: number = 0;
  public second: number = 0;

  constructor(
    year?: number,
    monthIndex?: number,
    day?: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
  ) {
    if (year == null || monthIndex == null || day == null) {
      const today = new Date();
      const bs = adToBs(today);
      this.year = bs.year;
      this.monthIndex = bs.monthIndex;
      this.day = bs.day;
      this.hour = today.getHours();
      this.minute = today.getMinutes();
      this.second = today.getSeconds();
    } else {
      validateDate(year, monthIndex, day);
      this.year = year;
      this.monthIndex = monthIndex;
      this.day = day;
      this.hour = hour;
      this.minute = minute;
      this.second = second;
    }
  }

  // ---------------- STATIC HELPERS ----------------

  static fromBS(value?: DateArg): NepaliDate {
    if (!value) return new NepaliDate();
    const nd = NepaliDate.parse(value, "BS");
    // preserve time if available
    return new NepaliDate(
      nd.year,
      nd.monthIndex,
      nd.day,
      nd.hour,
      nd.minute,
      nd.second,
    );
  }

  static fromAD(value?: DateArg): NepaliDate {
    let ad: Date;

    function toNepaliDate(date: Date, offset: "local" | "UTC") {
      const isLocal = offset === "local";
      const bs = adToBs(date);
      return new NepaliDate(
        bs.year,
        bs.monthIndex,
        bs.day,
        isLocal ? date.getHours() : date.getUTCHours(),
        isLocal ? date.getMinutes() : date.getUTCMinutes(),
        isLocal ? date.getSeconds() : date.getUTCSeconds(),
      );
    }

    if (!value) {
      ad = new Date();
    } else if (value instanceof Date) {
      ad = value;
    } else if (value instanceof NepaliDate) {
      ad = value.toAD();
    } else if (typeof value === "string") {
      const parsed = NepaliDate.parse(value, "AD");
      ad = parsed.toAD();
    } else if (typeof value === "number") {
      return toNepaliDate(new Date(value), "local");
    } else if (Array.isArray(value)) {
      ad = new Date(value[0], value[1], value[2]);
    } else {
      const parsed = NepaliDate.parse(value, "AD");
      ad = parsed.toAD();
    }

    return toNepaliDate(ad, "UTC");
  }

  // ---------------- PARSE ----------------

  static parse(value?: DateArg, calendar: "BS" | "AD" = "BS"): NepaliDate {
    if (!value) return NepaliDate.fromBS();

    if (value instanceof NepaliDate) return value.clone();
    if (value instanceof Date) {
      const { year, monthIndex, day } = adToBs(value);
      return new NepaliDate(
        year,
        monthIndex,
        day,
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
      );
    }
    if (typeof value === "number") {
      const d = new Date(value);
      const { year, monthIndex, day } = adToBs(d);
      return new NepaliDate(
        year,
        monthIndex,
        day,
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
      );
    }
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      if (calendar === "BS") return new NepaliDate(y, m, d);
      const { year, monthIndex, day } = adToBs(new Date(y, m, d));
      return new NepaliDate(year, monthIndex, day);
    }

    if (typeof value === "string") {
      const [datePart, timePart] = value.trim().split(" ");

      // Parse date
      const normalized = datePart.replace(/\//g, "-");
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

      // Parse time if available
      let hour = 0,
        minute = 0,
        second = 0;

      if (timePart) {
        const timeParts = timePart.split(":").map((v) => parseInt(v, 10));
        hour = timeParts[0] ?? 0;
        minute = timeParts[1] ?? 0;
        second = timeParts[2] ?? 0;
      }

      const adDate = new Date(Date.UTC(year, month, day, hour, minute, second));

      if (calendar === "BS")
        return new NepaliDate(year, month, day, hour, minute, second);

      const { year: y2, monthIndex: m2, day: d2 } = adToBs(adDate);
      return new NepaliDate(y2, m2, d2, hour, minute, second);
    }

    throw new Error(`Unsupported value for NepaliDate.parse: ${value}`);
  }

  // ---------------- CONVERSION ----------------

  toAD(): Date {
    const dateOnly = bsToAd(this.year, this.monthIndex, this.day);
    dateOnly.setUTCHours(this.hour, this.minute, this.second, 0);
    return dateOnly;
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
      this.day === other.day &&
      this.hour === other.hour &&
      this.minute === other.minute &&
      this.second === other.second
    );
  }

  // ---------------- FORMATTING ----------------

  format(options?: {
    format?: FormatString;
    calendar?: (typeof CALENDARS)[number];
    locale?: (typeof LOCALE)[number];
    withTime?: boolean;
  }): string {
    const {
      format = "YYYY-MM-DD",
      calendar = "BS",
      locale = "en",
      withTime = false,
    } = options ?? {};

    const pad = (n: number) => n.toString().padStart(2, "0");

    const shouldIncludeTime =
      withTime && Boolean(this.hour || this.minute || this.second);

    let formatted: string;

    if (calendar === "BS") {
      formatted = formatDateBS(this, format, locale);
    } else {
      formatted = formatDateAD(this.toAD(), format, locale);
    }

    if (shouldIncludeTime) {
      formatted += ` ${pad(this.hour)}:${pad(this.minute)}:${pad(this.second)}`;
    }

    return formatted;
  }

  static getFormatTokens(): Record<string, string> {
    return FORMAT_TOKENS;
  }

  // ---------------- UTILITIES ----------------

  clone(): NepaliDate {
    return new NepaliDate(
      this.year,
      this.monthIndex,
      this.day,
      this.hour,
      this.minute,
      this.second,
    );
  }
}
