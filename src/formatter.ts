import type { NepaliDate } from "./NepaliDate";

export const ALLOWED_FORMATS = [
  // Numeric YYYY first
  "YYYY-MM-DD",
  "YYYY/MM/DD",
  "YYYY.MM.DD",
  "YYYY-M-D",
  "YYYY/M/D",
  "YYYY.M.D",

  // Numeric DD first
  "DD-MM-YYYY",
  "DD/MM/YYYY",
  "DD.MM.YYYY",
  "D-M-YYYY",
  "D/M/YYYY",
  "D.M.YYYY",

  // Month names full
  "MMMM D, YYYY",
  "MMMM DD, YYYY",
  "D MMMM, YYYY",
  "DD MMMM, YYYY",

  // Month names short
  "MMM D, YYYY",
  "MMM DD, YYYY",
  "D MMM, YYYY",
  "DD MMM, YYYY",

  // Year short
  "YY-MM-DD",
  "DD-MM-YY",
] as const;

export type FormatString = (typeof ALLOWED_FORMATS)[number];

/** Token reference for BS and AD formatting */
export const FORMAT_TOKENS = {
  // Year
  YYYY: "Full year (e.g., 2079 or 2022)",
  YY: "2-digit year (e.g., 79 or 22)",

  // Month
  MM: "Month as 2-digit number, 01-12",
  M: "Month as number, 1-12",
  MMMM: "Full month name (e.g., Baishakh / बैशाख)",
  MMM: "Short month name (e.g., Bai / बै)",

  // Day
  DD: "Day of month as 2-digit, 01-31",
  D: "Day of month as number, 1-31",

  // Weekday (AD only)
  dddd: "Full weekday name (e.g., Monday / सोमवार)",
  ddd: "Short weekday name (e.g., Mon / सोम)",
};

/** List of all supported calendars */
export const CALENDARS = ["BS", "AD"] as const;

/** List of supported locales */
export const LOCALES = ["en", "ne"] as const;

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const MONTH_NAMES_EN = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];
const MONTH_SHORT_EN = [
  "Bai",
  "Jes",
  "Ash",
  "Shr",
  "Bha",
  "Ashw",
  "Kar",
  "Man",
  "Pou",
  "Mag",
  "Fal",
  "Chai",
];
const MONTH_NAMES_NE = [
  "बैशाख",
  "जेष्ठ",
  "आषाढ",
  "श्रावण",
  "भाद्र",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];
const MONTH_SHORT_NE = [
  "बै",
  "जे",
  "आ",
  "श्र",
  "भा",
  "आ",
  "का",
  "मं",
  "पौ",
  "म",
  "फा",
  "चै",
];
const WEEKDAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WEEKDAY_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES_NE = [
  "आइतवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
];
const WEEKDAY_SHORT_NE = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

function padNumber(num: number, locale: "en" | "ne" = "en"): string {
  const str = num.toString().padStart(2, "0");
  return locale === "ne"
    ? str.replace(/\d/g, (d) => nepaliDigits[Number(d)])
    : str;
}

function formatNumber(num: number, locale: "en" | "ne" = "en"): string {
  if (locale === "en") return String(num);
  return String(num).replace(/\d/g, (d) => nepaliDigits[Number(d)]);
}

function replaceTokens(
  template: string,
  replacements: Record<string, string>,
): string {
  let result = template;

  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

  for (const token of tokens) {
    result = result.replace(new RegExp(token, "g"), replacements[token]);
  }

  return result;
}

/** Format BS date */
export function formatDateBS(
  date: NepaliDate,
  format: FormatString = "YYYY-MM-DD",
  locale: "en" | "ne" = "en",
): string {
  const y = formatNumber(date.year, locale);

  const replacements: Record<string, string> = {
    YYYY: y,
    YY: y.slice(-2),
    MM: padNumber(date.monthIndex + 1, locale),
    M: formatNumber(date.monthIndex + 1, locale),
    DD: padNumber(date.day, locale),
    D: formatNumber(date.day, locale),
    MMMM:
      locale === "ne"
        ? MONTH_NAMES_NE[date.monthIndex]
        : MONTH_NAMES_EN[date.monthIndex],
    MMM:
      locale === "ne"
        ? MONTH_SHORT_NE[date.monthIndex]
        : MONTH_SHORT_EN[date.monthIndex],
  };

  return replaceTokens(format, replacements);
}

/** Format AD date */
export function formatDateAD(
  date: Date,
  format = "YYYY-MM-DD",
  locale: "en" | "ne" = "en",
): string {
  const year = formatNumber(date.getFullYear(), locale);
  const month = date.getMonth();
  const weekday = date.getDay();

  const replacements: Record<string, string> = {
    YYYY: year,
    YY: year.slice(-2),
    MM: String(month + 1).padStart(2, "0"),
    M: String(month + 1),
    DD: String(date.getDate()).padStart(2, "0"),
    D: String(date.getDate()),
    dddd:
      locale === "ne" ? WEEKDAY_NAMES_NE[weekday] : WEEKDAY_NAMES_EN[weekday],
    ddd:
      locale === "ne" ? WEEKDAY_SHORT_NE[weekday] : WEEKDAY_SHORT_EN[weekday],
    MMMM: locale === "ne" ? MONTH_NAMES_NE[month] : MONTH_NAMES_EN[month],
    MMM: locale === "ne" ? MONTH_SHORT_NE[month] : MONTH_SHORT_EN[month],
  };

  return replaceTokens(format, replacements);
}
