import { describe, expect, it } from "vitest";
import { NepaliDate } from "../src";
import { BS_MONTH_DAYS, MAX_YEAR_BS, MIN_YEAR_BS } from "../src/data";

describe("NepaliDate - Comprehensive Valid Date Tests", () => {
  describe("Basic Conversions", () => {
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
  });

  describe("Round-trip Conversion - All Valid BS Dates", () => {
    it("should convert BS -> AD -> BS for first, middle, and last day of every month", () => {
      let testedDates = 0;
      const errors: string[] = [];

      for (let year = MIN_YEAR_BS; year <= MAX_YEAR_BS; year++) {
        for (let month = 0; month < 12; month++) {
          const daysInMonth = BS_MONTH_DAYS[year][month];

          // Test first day, middle day, and last day
          const testDays = [1, Math.ceil(daysInMonth / 2), daysInMonth];

          for (const day of testDays) {
            try {
              const original = new NepaliDate(year, month, day);
              const ad = original.toAD();
              const converted = NepaliDate.fromAD(ad);

              if (!converted.equals(original)) {
                errors.push(
                  `BS->AD->BS failed: ${year}/${month + 1}/${day} -> ` +
                    `${converted.year}/${converted.monthIndex + 1}/${converted.day}`,
                );
              }
              testedDates++;
            } catch (e: any) {
              errors.push(`Error at ${year}/${month + 1}/${day}: ${e.message}`);
            }
          }
        }
      }

      console.log(
        `✓ Tested ${testedDates} BS dates (first/middle/last of each month)`,
      );

      if (errors.length > 0) {
        console.error(`Found ${errors.length} errors:`, errors.slice(0, 10));
      }

      expect(errors).toEqual([]);
    });

    it("should convert BS -> AD -> BS for ALL days in sampled years", () => {
      let testedDates = 0;
      const errors: string[] = [];

      // Test every 5th year thoroughly (all days)
      const sampleYears = [];
      for (let year = MIN_YEAR_BS; year <= MAX_YEAR_BS; year += 5) {
        sampleYears.push(year);
      }

      for (const year of sampleYears) {
        for (let month = 0; month < 12; month++) {
          const daysInMonth = BS_MONTH_DAYS[year][month];

          for (let day = 1; day <= daysInMonth; day++) {
            try {
              const original = new NepaliDate(year, month, day);
              const ad = original.toAD();
              const converted = NepaliDate.fromAD(ad);

              if (!converted.equals(original)) {
                errors.push(
                  `Failed: ${year}/${month + 1}/${day} -> ` +
                    `${converted.year}/${converted.monthIndex + 1}/${converted.day}`,
                );
              }
              testedDates++;
            } catch (e: any) {
              errors.push(`Error at ${year}/${month + 1}/${day}: ${e.message}`);
            }
          }
        }
      }

      console.log(
        `✓ Tested ${testedDates} BS dates (every day in sampled years)`,
      );

      if (errors.length > 0) {
        console.error(`Found ${errors.length} errors:`, errors.slice(0, 10));
      }

      expect(errors).toEqual([]);
    });

    it("should convert AD -> BS -> AD for date range (every 7 days)", () => {
      let testedDates = 0;
      const errors: string[] = [];

      const startDate = new NepaliDate(MIN_YEAR_BS, 0, 1).toAD();
      const endDate = new NepaliDate(
        MAX_YEAR_BS,
        11,
        BS_MONTH_DAYS[MAX_YEAR_BS][11],
      ).toAD();

      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        try {
          const bs = NepaliDate.fromAD(currentDate);
          const adConverted = bs.toAD();

          // Compare dates (ignore time)
          const originalStr = currentDate.toISOString().split("T")[0];
          const convertedStr = adConverted.toISOString().split("T")[0];

          if (originalStr !== convertedStr) {
            errors.push(
              `AD->BS->AD failed: ${originalStr} -> ` +
                `BS(${bs.year}/${bs.monthIndex + 1}/${bs.day}) -> ${convertedStr}`,
            );
          }
          testedDates++;
        } catch (e: any) {
          errors.push(`Error at ${currentDate.toISOString()}: ${e.message}`);
        }

        // Test every 7 days (change to 1 for exhaustive test)
        currentDate.setDate(currentDate.getDate() + 7);
      }

      console.log(`✓ Tested ${testedDates} AD dates (every 7 days)`);

      if (errors.length > 0) {
        console.error(`Found ${errors.length} errors:`, errors.slice(0, 10));
      }

      expect(errors).toEqual([]);
    });
  });

  describe("Edge Cases and Boundaries", () => {
    it("should handle first date in range", () => {
      const d = new NepaliDate(MIN_YEAR_BS, 0, 1);
      const ad = d.toAD();
      const d2 = NepaliDate.fromAD(ad);
      expect(d2.equals(d)).toBe(true);
    });

    it("should handle last date in range", () => {
      const lastDay = BS_MONTH_DAYS[MAX_YEAR_BS][11];
      const d = new NepaliDate(MAX_YEAR_BS, 11, lastDay);
      const ad = d.toAD();
      const d2 = NepaliDate.fromAD(ad);
      expect(d2.equals(d)).toBe(true);
    });
  });

  describe("Date Comparisons", () => {
    it("should compare dates correctly", () => {
      const d1 = new NepaliDate(2079, 0, 1);
      const d2 = new NepaliDate(2079, 0, 15);

      expect(d1.before(d2)).toBe(true);
      expect(d2.after(d1)).toBe(true);
      expect(d1.equals(d2)).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should throw errors on invalid monthIndex", () => {
      expect(() => new NepaliDate(2079, -1, 1)).toThrow();
      expect(() => new NepaliDate(2079, 12, 1)).toThrow();
    });

    it("should throw errors on invalid day", () => {
      expect(() => new NepaliDate(2079, 0, 0)).toThrow();
      expect(() => new NepaliDate(2079, 0, 32)).toThrow();
    });
  });
});
