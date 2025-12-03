import { NepaliDate } from "./NepaliDate";

export function parseBS(dateStr: string): NepaliDate {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new NepaliDate(y, m, d);
}
