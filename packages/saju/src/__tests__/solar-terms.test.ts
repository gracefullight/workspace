import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { createLuxonAdapter } from "@/adapters/luxon";
import { analyzeSolarTerms, getSolarTermsForYear, SOLAR_TERMS } from "@/core/solar-terms";

describe("solar-terms", async () => {
  const adapter = await createLuxonAdapter();

  describe("SOLAR_TERMS", () => {
    it("should have 24 terms", () => {
      expect(SOLAR_TERMS).toHaveLength(24);
    });

    it("should have terms at 15-degree intervals", () => {
      for (let i = 0; i < SOLAR_TERMS.length; i++) {
        const expectedLon = (285 + i * 15) % 360;
        expect(SOLAR_TERMS[i].longitude).toBe(expectedLon);
      }
    });

    it("should start with 소한 at 285°", () => {
      expect(SOLAR_TERMS[0]).toEqual({
        key: "minorCold",
        korean: "소한",
        hanja: "小寒",
        longitude: 285,
      });
    });

    it("should have 입춘 at 315°", () => {
      const ipchun = SOLAR_TERMS.find((t) => t.korean === "입춘");
      expect(ipchun).toEqual({
        key: "springBegins",
        korean: "입춘",
        hanja: "立春",
        longitude: 315,
      });
    });
  });

  describe("analyzeSolarTerms", () => {
    it("should return current and next solar terms for mid-January", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 1, day: 15 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.current.korean).toBe("소한");
      expect(result.next.korean).toBe("대한");
      expect(result.daysSinceCurrent).toBeGreaterThanOrEqual(0);
      expect(result.daysUntilNext).toBeGreaterThan(0);
    });

    it("should return current and next solar terms for early February", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 2, day: 3 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.current.korean).toBe("대한");
      expect(result.next.korean).toBe("입춘");
    });

    it("should return current and next solar terms for summer solstice period", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 6, day: 25 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.current.korean).toBe("하지");
      expect(result.next.korean).toBe("소서");
    });

    it("should return current and next solar terms for winter solstice period", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 12, day: 25 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.current.korean).toBe("동지");
      expect(result.next.korean).toBe("소한");
    });

    it("should calculate days since current term correctly", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 3, day: 25 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.current.korean).toBe("춘분");
      expect(result.daysSinceCurrent).toBeGreaterThanOrEqual(0);
      expect(result.daysSinceCurrent).toBeLessThan(16);
    });

    it("should calculate days until next term correctly", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 4, day: 1 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.next.korean).toBe("청명");
      expect(result.daysUntilNext).toBeGreaterThan(0);
      expect(result.daysUntilNext).toBeLessThan(16);
    });

    it("should include date information for current and next terms", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 5, day: 10 }, { zone: "Asia/Seoul" });
      const result = analyzeSolarTerms(dt, { adapter });

      expect(result.currentDate).toHaveProperty("year");
      expect(result.currentDate).toHaveProperty("month");
      expect(result.currentDate).toHaveProperty("day");
      expect(result.currentDate).toHaveProperty("hour");
      expect(result.currentDate).toHaveProperty("minute");

      expect(result.nextDate).toHaveProperty("year");
      expect(result.nextDate).toHaveProperty("month");
      expect(result.nextDate).toHaveProperty("day");
      expect(result.nextDate).toHaveProperty("hour");
      expect(result.nextDate).toHaveProperty("minute");
    });
  });

  describe("getSolarTermsForYear", () => {
    it("should return 24 terms for a year", () => {
      const terms = getSolarTermsForYear(2024, { adapter, timezone: "Asia/Seoul" });
      expect(terms).toHaveLength(24);
    });

    it("should have all terms in order", () => {
      const terms = getSolarTermsForYear(2024, { adapter, timezone: "Asia/Seoul" });
      const names = terms.map((t) => t.term.korean);

      expect(names[0]).toBe("소한");
      expect(names[2]).toBe("입춘");
      expect(names[5]).toBe("춘분");
      expect(names[11]).toBe("하지");
      expect(names[17]).toBe("추분");
      expect(names[23]).toBe("동지");
    });

    it("should have dates in chronological order within months", () => {
      const terms = getSolarTermsForYear(2024, { adapter, timezone: "Asia/Seoul" });

      for (const term of terms) {
        expect(term.date.year).toBe(2024);
        expect(term.date.month).toBeGreaterThanOrEqual(1);
        expect(term.date.month).toBeLessThanOrEqual(12);
        expect(term.date.day).toBeGreaterThanOrEqual(1);
        expect(term.date.day).toBeLessThanOrEqual(31);
      }
    });

    it("should have 입춘 around February 4", () => {
      const terms = getSolarTermsForYear(2024, { adapter, timezone: "Asia/Seoul" });
      const ipchun = terms.find((t) => t.term.korean === "입춘");

      expect(ipchun?.date.month).toBe(2);
      expect(ipchun?.date.day).toBeGreaterThanOrEqual(3);
      expect(ipchun?.date.day).toBeLessThanOrEqual(5);
    });

    it("should have 하지 around June 21", () => {
      const terms = getSolarTermsForYear(2024, { adapter, timezone: "Asia/Seoul" });
      const haji = terms.find((t) => t.term.korean === "하지");

      expect(haji?.date.month).toBe(6);
      expect(haji?.date.day).toBeGreaterThanOrEqual(20);
      expect(haji?.date.day).toBeLessThanOrEqual(22);
    });
  });
});
