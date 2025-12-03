// src/formatter.ts

import type { NepaliDate } from "./NepaliDate";

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Convert a number to Nepali digits if locale is 'ne', else English digits
 */
function formatNumber(num: number, locale: "en" | "ne" = "en"): string {
  if (locale === "en") return num.toString();
  return num
    .toString()
    .split("")
    .map((d) => (/\d/.test(d) ? nepaliDigits[Number(d)] : d))
    .join("");
}

/**
 * Format a NepaliDate as a string
 * Example: 2079-0-1 (monthIndex 0-based)
 * locale 'ne' replaces digits with Nepali numbers
 */
export function formatDateBS(
  date: NepaliDate,
  locale: "en" | "ne" = "en",
): string {
  const y = formatNumber(date.year, locale);
  const m = formatNumber(date.monthIndex, locale); // 0-based
  const d = formatNumber(date.day, locale);
  return `${y}-${m}-${d}`;
}

/**
 * Optional: format with human-readable month names
 */
const nepaliMonthNames = [
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

export function formatDateBSLong(
  date: NepaliDate,
  locale: "en" | "ne" = "en",
): string {
  const y = formatNumber(date.year, locale);
  const mName = nepaliMonthNames[date.monthIndex]; // 0-based
  const d = formatNumber(date.day, locale);
  return locale === "ne" ? `${d} ${mName} ${y}` : `${d} ${mName} ${y}`;
}
