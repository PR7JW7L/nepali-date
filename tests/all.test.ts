import { describe, expect, it } from "vitest";
import { NepaliDate } from "../src";

describe("NepaliDate", () => {
  it("should create a valid NepaliDate", () => {
    const d = new NepaliDate(2079, 0, 1);
    expect(d.year).toBe(2079);
    expect(d.monthIndex).toBe(0);
    expect(d.day).toBe(1);
  });

  it("should convert BS -> AD -> BS consistently", () => {
    const d = new NepaliDate(2079, 0, 1);
    const ad = d.toAD();
    const d2 = NepaliDate.fromAD(ad);
    expect(d2.equals(d)).toBe(true);
  });

  it("should perform arithmetic correctly", () => {
    const d = new NepaliDate(2079, 0, 1);
    const dPlus10 = d.addDays(10);
    expect(dPlus10.diffDays(d)).toBe(10);

    const dMinus10 = dPlus10.subtractDays(10);
    expect(dMinus10.equals(d)).toBe(true);
  });

  it("should compare dates correctly", () => {
    const d1 = new NepaliDate(2079, 0, 1);
    const d2 = new NepaliDate(2079, 0, 15);

    expect(d1.before(d2)).toBe(true);
    expect(d2.after(d1)).toBe(true);
    expect(d1.equals(d2)).toBe(false);
  });

  it("should format dates correctly", () => {
    const d = new NepaliDate(2079, 0, 1);
    expect(d.format()).toBe("2079-0-1");
  });

  it("should throw errors on invalid monthIndex", () => {
    expect(() => new NepaliDate(2079, -1, 1)).toThrow();
    expect(() => new NepaliDate(2079, 12, 1)).toThrow();
  });

  it("should handle edge cases with conversion correctly", () => {
    const d = new NepaliDate(2079, 0, 1);
    const ad = d.toAD();
    const dFromAd = NepaliDate.fromAD(ad);
    expect(dFromAd.equals(d)).toBe(true);
  });
});
