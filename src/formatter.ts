import type { NepaliDate } from "./NepaliDate";

export const ALLOWED_FORMATS = [
  "YYYY-MM-DD",
  "YYYY/MM/DD",
  "YYYY.MM.DD",
  "YYYY-M-D",
  "YYYY/M/D",
  "YYYY.M.D",
  "DD-MM-YYYY",
  "DD/MM/YYYY",
  "DD.MM.YYYY",
  "D-M-YYYY",
  "D/M/YYYY",
  "D.M.YYYY",
  "MMMM D, YYYY",
  "MMMM DD, YYYY",
  "D MMMM, YYYY",
  "DD MMMM, YYYY",
  "MMM D, YYYY",
  "MMM DD, YYYY",
  "D MMM, YYYY",
  "DD MMM, YYYY",
] as const;

export type FormatString = (typeof ALLOWED_FORMATS)[number];

export const FORMAT_TOKENS = {
  YYYY: "Full year (e.g., 2079 or 2022)",
  MM: "Month as 2-digit number, 01-12",
  M: "Month as number, 1-12",
  MMMM: "Full month name",
  MMM: "Short month name",
  DD: "Day of month as 2-digit, 01-31",
  D: "Day of month as number, 1-31",
  dddd: "Full weekday name (AD only)",
  ddd: "Short weekday name (AD only)",
};

export const CALENDARS = ["BS", "AD"] as const;

// Nepali digits
export const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export const MONTH_NAMES_EN_BS = [
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

export const MONTH_NAMES_NE_BS = [
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

export const MONTH_SHORT_NE_BS = [
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

// ---------------- AD months ----------------
export const MONTH_NAMES_EN_AD = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTH_SHORT_EN_AD = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ---------------- Weekdays ----------------
export const WEEKDAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const WEEKDAY_SHORT_EN = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
export const WEEKDAY_NAMES_NE = [
  "आइतवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
];

export const WEEKDAY_SHORT_NE = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिहि",
  "शुक्र",
  "शनि",
];

const BS_TO_AD_INDEX_MAPPING = [
  [3, 4], // Baishakh: Apr/May
  [4, 5], // Jestha: May/Jun
  [5, 6], // Ashadh: Jun/Jul
  [6, 7], // Shrawan: Jul/Aug
  [7, 8], // Bhadra: Aug/Sep
  [8, 9], // Ashwin: Sep/Oct
  [9, 10], // Kartik: Oct/Nov
  [10, 11], // Mangsir: Nov/Dec
  [11, 0], // Poush: Dec/Jan
  [0, 1], // Magh: Jan/Feb
  [1, 2], // Falgun: Feb/Mar
  [2, 3], // Chaitra: Mar/Apr
];

export const BS_MONTHS_WITH_AD = MONTH_NAMES_EN_BS.map((en, index) => {
  const [adMonth1, adMonth2] = BS_TO_AD_INDEX_MAPPING[index];
  const ad = `${MONTH_SHORT_EN_AD[adMonth1]}/${MONTH_SHORT_EN_AD[adMonth2]}`;

  return {
    en,
    np: MONTH_NAMES_NE_BS[index],
    ad,
  };
});

// ---------------- Helpers ----------------
export function padNumber(num: number, locale: "en" | "ne" = "en") {
  const str = num.toString().padStart(2, "0");
  return locale === "ne"
    ? str.replace(/\d/g, (d) => nepaliDigits[Number(d)])
    : str;
}

export function formatNumber(num: number, locale: "en" | "ne" = "en") {
  return locale === "ne"
    ? String(num).replace(/\d/g, (d) => nepaliDigits[Number(d)])
    : String(num);
}

function replaceTokens(template: string, replacements: Record<string, string>) {
  // Sort tokens by length descending to replace longest first
  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

  // Create a regex that matches any of the tokens as whole units
  const pattern = new RegExp(
    tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "g",
  );

  return template.replace(pattern, (match) => replacements[match]);
}

// ---------------- Format BS ----------------
export function formatDateBS(
  date: NepaliDate,
  format: FormatString = "YYYY-MM-DD",
) {
  const y = formatNumber(date.year, "ne");
  console.log(date.monthIndex, MONTH_NAMES_NE_BS[date.monthIndex]);
  const replacements: Record<string, string> = {
    YYYY: y,
    MM: padNumber(date.monthIndex + 1, "ne"),
    M: formatNumber(date.monthIndex + 1, "ne"),
    DD: padNumber(date.day, "ne"),
    D: formatNumber(date.day, "ne"),
    MMMM: MONTH_NAMES_NE_BS[date.monthIndex],
    MMM: MONTH_SHORT_NE_BS[date.monthIndex],
  };
  return replaceTokens(format, replacements);
}

// ---------------- Format AD ----------------
export function formatDateAD(date: Date, format: FormatString = "YYYY-MM-DD") {
  const y = formatNumber(date.getFullYear(), "en");
  const m = date.getMonth();
  const d = date.getDate();
  const wd = date.getDay();

  const replacements: Record<string, string> = {
    YYYY: y,
    MM: padNumber(m + 1, "en"),
    M: formatNumber(m + 1, "en"),
    DD: padNumber(d, "en"),
    D: formatNumber(d, "en"),
    dddd: WEEKDAY_NAMES_EN[wd],
    ddd: WEEKDAY_SHORT_EN[wd],
    MMMM: MONTH_NAMES_EN_AD[m],
    MMM: MONTH_SHORT_EN_AD[m],
  };
  return replaceTokens(format, replacements);
}
