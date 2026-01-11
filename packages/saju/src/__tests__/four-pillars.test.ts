import { DateTime } from "luxon";
import { beforeAll, describe, expect, it } from "vitest";
import type { DateAdapter } from "@/adapters/date-adapter";
import { createLuxonAdapter } from "@/adapters/luxon";
import {
  BRANCHES,
  dayPillarFromDate,
  effectiveDayDate,
  getFourPillars,
  hourPillar,
  monthPillar,
  presetA,
  presetB,
  STEMS,
  yearPillar,
} from "@/core/four-pillars";

describe("Four Pillars Core", () => {
  let adapter: DateAdapter<DateTime>;

  beforeAll(async () => {
    adapter = await createLuxonAdapter();
  });

  describe("Constants", () => {
    it("should have 10 stems", () => {
      expect(STEMS).toHaveLength(10);
      expect(STEMS[0]).toBe("甲");
      expect(STEMS[9]).toBe("癸");
    });

    it("should have 12 branches", () => {
      expect(BRANCHES).toHaveLength(12);
      expect(BRANCHES[0]).toBe("子");
      expect(BRANCHES[11]).toBe("亥");
    });
  });

  describe("dayPillarFromDate", () => {
    it("should calculate day pillar for test case (1985-05-15 = 甲寅)", () => {
      const result = dayPillarFromDate({ year: 1985, month: 5, day: 15 });
      expect(result.pillar).toBe("甲寅");
      expect(result.idx60).toBe(50);
    });

    it("should handle 60-day cycle correctly", () => {
      const start = dayPillarFromDate({ year: 1985, month: 5, day: 15 });
      const after60 = dayPillarFromDate({ year: 1985, month: 7, day: 14 });
      expect(start.idx60).toBe(after60.idx60);
    });

    it("should calculate day pillar for leap year date", () => {
      const result = dayPillarFromDate({ year: 2000, month: 2, day: 29 });
      expect(result.pillar).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it("should calculate day pillar for year boundary", () => {
      const dec31 = dayPillarFromDate({ year: 1999, month: 12, day: 31 });
      const jan01 = dayPillarFromDate({ year: 2000, month: 1, day: 1 });
      expect((jan01.idx60 - dec31.idx60 + 60) % 60).toBe(1);
    });
  });

  describe("yearPillar", () => {
    it("should calculate year pillar for 1984 (甲子)", () => {
      const dt = DateTime.fromObject({ year: 1984, month: 3, day: 1 }, { zone: "Asia/Seoul" });
      const result = yearPillar(dt, { adapter });
      expect(result.pillar).toBe("甲子");
      expect(result.solarYear).toBe(1984);
    });

    it("should calculate year pillar for 1985 (乙丑)", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 5, day: 15 }, { zone: "Asia/Seoul" });
      const result = yearPillar(dt, { adapter });
      expect(result.pillar).toBe("乙丑");
      expect(result.solarYear).toBe(1985);
    });

    it("should handle date before Lichun (立春)", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 1, day: 15 }, { zone: "Asia/Seoul" });
      const result = yearPillar(dt, { adapter });
      expect(result.solarYear).toBe(1984);
    });

    it("should handle date after Lichun", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 3, day: 1 }, { zone: "Asia/Seoul" });
      const result = yearPillar(dt, { adapter });
      expect(result.solarYear).toBe(1985);
    });

    it("should follow 60-year cycle", () => {
      const dt1 = DateTime.fromObject({ year: 1984, month: 3, day: 1 }, { zone: "Asia/Seoul" });
      const dt2 = DateTime.fromObject({ year: 2044, month: 3, day: 1 }, { zone: "Asia/Seoul" });
      const result1 = yearPillar(dt1, { adapter });
      const result2 = yearPillar(dt2, { adapter });
      expect(result1.pillar).toBe(result2.pillar);
    });
  });

  describe("monthPillar", () => {
    it("should calculate month pillar for test case (1985-05-15)", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 5, day: 15 }, { zone: "Asia/Seoul" });
      const result = monthPillar(dt, { adapter });
      expect(result.pillar).toBe("辛巳");
    });

    it("should return valid stem-branch combination", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 5, day: 15 }, { zone: "Asia/Seoul" });
      const result = monthPillar(dt, { adapter });
      expect(result.pillar).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it("should include sun longitude in result", () => {
      const dt = DateTime.fromObject({ year: 1985, month: 5, day: 15 }, { zone: "Asia/Seoul" });
      const result = monthPillar(dt, { adapter });
      expect(result.sunLonDeg).toBeGreaterThanOrEqual(0);
      expect(result.sunLonDeg).toBeLessThan(360);
    });

    it("should calculate different months correctly", () => {
      const jan = DateTime.fromObject({ year: 1985, month: 1, day: 15 }, { zone: "Asia/Seoul" });
      const jul = DateTime.fromObject({ year: 1985, month: 7, day: 15 }, { zone: "Asia/Seoul" });
      const result1 = monthPillar(jan, { adapter });
      const result2 = monthPillar(jul, { adapter });
      expect(result1.pillar).not.toBe(result2.pillar);
    });
  });

  describe("effectiveDayDate", () => {
    it("should return same date for midnight boundary before 23:00", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 15, hour: 22, minute: 30 },
        { zone: "Asia/Seoul" },
      );
      const result = effectiveDayDate(dt, { adapter, dayBoundary: "midnight" });
      expect(result.year).toBe(1985);
      expect(result.month).toBe(5);
      expect(result.day).toBe(15);
    });

    it("should advance date for zi23 boundary after 23:00", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 15, hour: 23, minute: 30 },
        { zone: "Asia/Seoul" },
      );
      const result = effectiveDayDate(dt, { adapter, dayBoundary: "zi23" });
      expect(result.year).toBe(1985);
      expect(result.month).toBe(5);
      expect(result.day).toBe(16);
    });

    it("should not advance date for zi23 boundary before 23:00", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 15, hour: 22, minute: 59 },
        { zone: "Asia/Seoul" },
      );
      const result = effectiveDayDate(dt, { adapter, dayBoundary: "zi23" });
      expect(result.year).toBe(1985);
      expect(result.month).toBe(5);
      expect(result.day).toBe(15);
    });

    it("should handle month boundary with zi23", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 31, hour: 23, minute: 30 },
        { zone: "Asia/Seoul" },
      );
      const result = effectiveDayDate(dt, { adapter, dayBoundary: "zi23" });
      expect(result.year).toBe(1985);
      expect(result.month).toBe(6);
      expect(result.day).toBe(1);
    });

    it("should apply mean solar time correction when enabled", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 15, hour: 23, minute: 50 },
        { zone: "Asia/Seoul" },
      );
      const result = effectiveDayDate(dt, {
        adapter,
        dayBoundary: "zi23",
        longitudeDeg: 126.9,
        useMeanSolarTimeForBoundary: true,
      });
      expect(result.day).toBe(16);
    });
  });

  describe("hourPillar", () => {
    it("should calculate hour pillar for test case (2000-01-01 18:00)", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = hourPillar(dt, { adapter });
      expect(result.pillar).toBe("辛酉");
    });

    it("should return valid stem-branch combination", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = hourPillar(dt, { adapter });
      expect(result.pillar).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it("should calculate different hours correctly", () => {
      const morning = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 8, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const evening = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 20, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result1 = hourPillar(morning, { adapter });
      const result2 = hourPillar(evening, { adapter });
      expect(result1.pillar).not.toBe(result2.pillar);
    });

    it("should apply mean solar time correction when enabled", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const withCorrection = hourPillar(dt, {
        adapter,
        longitudeDeg: 126.9,
        useMeanSolarTimeForHour: true,
      });
      const withoutCorrection = hourPillar(dt, {
        adapter,
        longitudeDeg: 126.9,
        useMeanSolarTimeForHour: false,
      });
      expect(withCorrection.adjustedDt).not.toBe(withoutCorrection.adjustedDt);
    });
  });

  describe("getFourPillars - Preset A", () => {
    it("should calculate four pillars with preset A", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });

      expect(result.year).toBe("己卯");
      expect(result.month).toBe("丙子");
      expect(result.day).toBe("戊午");
      expect(result.hour).toBe("辛酉");
    });

    it("should include metadata", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });

      expect(result.meta.solarYearUsed).toBe(1999);
      expect(result.meta.sunLonDeg).toBeGreaterThan(0);
      expect(result.meta.effectiveDayDate).toEqual({ year: 2000, month: 1, day: 1 });
      expect(result.meta.preset).toEqual(presetA);
    });

    it("should include lunar date information", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });

      expect(result.lunar).toBeDefined();
      expect(result.lunar.lunarYear).toBe(1999);
      expect(result.lunar.lunarMonth).toBe(11);
      expect(result.lunar.lunarDay).toBe(25);
      expect(result.lunar.isLeapMonth).toBe(false);
    });
  });

  describe("getFourPillars - Preset B", () => {
    it("should calculate four pillars with preset B", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetB,
      });

      expect(result.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.hour).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it("should apply solar time corrections with preset B", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const resultA = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });
      const resultB = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetB,
      });

      expect(resultA).not.toEqual(resultB);
    });
  });

  describe("getFourPillars - Edge cases", () => {
    it("should handle date near 23:00 boundary", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 23, minute: 30 },
        { zone: "Asia/Seoul" },
      );
      const resultA = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });
      const _resultB = getFourPillars(dt, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetB,
      });

      expect(resultA.meta.effectiveDayDate.day).toBe(1);
    });

    it("should use default longitude from timezone offset when longitudeDeg is omitted", () => {
      const dt = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );

      const result = getFourPillars(dt, {
        adapter,
        preset: presetA,
      });

      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
    });

    it("should handle leap year dates", () => {
      const dt = DateTime.fromObject({ year: 2000, month: 2, day: 29 }, { zone: "UTC" });
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 0,
        preset: presetA,
      });

      expect(result.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(result.hour).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });

    it("should handle year boundary", () => {
      const dt = DateTime.fromObject(
        { year: 1999, month: 12, day: 31, hour: 23, minute: 59 },
        { zone: "UTC" },
      );
      const result = getFourPillars(dt, {
        adapter,
        longitudeDeg: 0,
        preset: presetA,
      });

      expect(result.meta.effectiveDayDate.year).toBe(1999);
      expect(result.meta.effectiveDayDate.month).toBe(12);
      expect(result.meta.effectiveDayDate.day).toBe(31);
    });

    it("should handle different timezones", () => {
      const seoul = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Seoul" },
      );
      const tokyo = DateTime.fromObject(
        { year: 2000, month: 1, day: 1, hour: 18, minute: 0 },
        { zone: "Asia/Tokyo" },
      );

      const resultSeoul = getFourPillars(seoul, {
        adapter,
        longitudeDeg: 126.9,
        preset: presetA,
      });
      const resultTokyo = getFourPillars(tokyo, {
        adapter,
        longitudeDeg: 139.7,
        preset: presetA,
      });

      expect(resultSeoul.year).toBe(resultTokyo.year);
      expect(resultSeoul.month).toBe(resultTokyo.month);
      expect(resultSeoul.day).toBe(resultTokyo.day);
    });

    it("should handle different longitudes affecting hour pillar", () => {
      const dt = DateTime.fromObject(
        { year: 1985, month: 5, day: 15, hour: 0, minute: 30 },
        { zone: "UTC" },
      );

      const westLong = getFourPillars(dt, {
        adapter,
        longitudeDeg: -120,
        preset: presetB,
      });
      const eastLong = getFourPillars(dt, {
        adapter,
        longitudeDeg: 120,
        preset: presetB,
      });

      expect(westLong.hour).not.toBe(eastLong.hour);
    });
  });
});
