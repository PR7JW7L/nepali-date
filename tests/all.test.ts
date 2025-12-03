import { describe, expect, it } from "vitest";
import { ALLOWED_FORMATS, NepaliDate } from "../src";

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
    expect(d.format()).toBe("2079-01-01");
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

  it("should convert my birthday correctly", () => {
    const d = new NepaliDate(2054, 9, 5);
    const ad = d.toAD();

    const expected = new Date(1998, 0, 18);

    expect(ad.getFullYear()).toBe(expected.getFullYear());
    expect(ad.getMonth()).toBe(expected.getMonth());
    expect(ad.getDate()).toBe(expected.getDate());

    const d2 = NepaliDate.fromAD(ad);
    expect(d2.equals(d)).toBe(true);
  });
});

describe("NepaliDate Formatting", () => {
  const bsDate = new NepaliDate(2079, 0, 5); // 2079-01-05 BS = 2022-04-18 AD
  const adDate = bsDate.toAD();

  it("should format BS numeric YYYY-MM-DD correctly", () => {
    expect(bsDate.format({ format: "YYYY-MM-DD" })).toBe("2079-01-05");
    expect(bsDate.format({ format: "YYYY-M-D" })).toBe("2079-1-5");
    expect(bsDate.format({ format: "DD-MM-YYYY" })).toBe("05-01-2079");
    expect(bsDate.format({ format: "D-M-YYYY" })).toBe("5-1-2079");
  });

  it("should format BS with full month names", () => {
    expect(bsDate.format({ format: "MMMM D, YYYY" })).toBe("Baishakh 5, 2079");
    expect(bsDate.format({ format: "D MMMM, YYYY" })).toBe("5 Baishakh, 2079");
  });

  it("should format BS with short month names", () => {
    expect(bsDate.format({ format: "MMM D, YYYY" })).toBe("Bai 5, 2079");
    expect(bsDate.format({ format: "D MMM, YYYY" })).toBe("5 Bai, 2079");
  });

  it("should format BS with Nepali locale digits", () => {
    expect(bsDate.format({ format: "YYYY-MM-DD", locale: "ne" })).toBe(
      "२०७९-०१-०५",
    );
    expect(bsDate.format({ format: "D MMMM, YYYY", locale: "ne" })).toBe(
      "५ बैशाख, २०७९",
    );
  });

  it("should format AD numeric correctly", () => {
    // default calendar is BS, so override to AD
    expect(bsDate.format({ format: "YYYY-MM-DD", calendar: "AD" })).toBe(
      adDate.toISOString().slice(0, 10),
    );
    expect(bsDate.format({ format: "D-M-YYYY", calendar: "AD" })).toBe(
      `${adDate.getDate()}-${adDate.getMonth() + 1}-${adDate.getFullYear()}`,
    );
  });

  it("should handle all allowed formats without throwing", () => {
    ALLOWED_FORMATS.forEach((fmt) => {
      expect(() => bsDate.format({ format: fmt })).not.toThrow();
    });
  });
});
