import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { createLuxonAdapter } from "@/adapters/luxon";
import { getSaju, STANDARD_PRESET } from "@/index";

describe("getSaju integration", () => {
  it("returns complete saju analysis with all required fields", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "male",
      preset: STANDARD_PRESET,
    });

    expect(result.pillars.year).toBeDefined();
    expect(result.pillars.month).toBeDefined();
    expect(result.pillars.day).toBeDefined();
    expect(result.pillars.hour).toBeDefined();
    expect(result.tenGods).toBeDefined();
    expect(result.strength).toBeDefined();
    expect(result.relations).toBeDefined();
    expect(result.yongShen).toBeDefined();
    expect(result.lunar).toBeDefined();
    expect(result.solarTerms).toBeDefined();
    expect(result.majorLuck).toBeDefined();
    expect(result.yearlyLuck).toBeDefined();
  });

  it("includes solar terms with current and next term info", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 2024, month: 1, day: 15, hour: 12 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "female",
      preset: STANDARD_PRESET,
    });

    expect(result.solarTerms.current.name).toBe("소한");
    expect(result.solarTerms.next.name).toBe("대한");
    expect(result.solarTerms.daysSinceCurrent).toBeGreaterThanOrEqual(0);
    expect(result.solarTerms.daysUntilNext).toBeGreaterThan(0);
    expect(result.solarTerms.currentDate).toBeDefined();
    expect(result.solarTerms.nextDate).toBeDefined();
  });

  it("includes major luck by default", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "male",
      preset: STANDARD_PRESET,
    });

    expect(result.majorLuck).toBeDefined();
    expect(result.majorLuck.pillars.length).toBeGreaterThan(0);
    expect(result.majorLuck.startAge).toBeGreaterThanOrEqual(0);
  });

  it("includes yearly luck by default with custom range", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "female",
      preset: STANDARD_PRESET,
      yearlyLuckRange: { from: 2024, to: 2026 },
    });

    expect(result.yearlyLuck).toBeDefined();
    expect(result.yearlyLuck.length).toBe(3);
    expect(result.yearlyLuck[0].year).toBe(2024);
    expect(result.yearlyLuck[2].year).toBe(2026);
  });

  it("uses default yearly luck range when not specified", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "male",
      currentYear: 2024,
    });

    expect(result.yearlyLuck.length).toBe(16);
    expect(result.yearlyLuck[0].year).toBe(2019);
    expect(result.yearlyLuck[15].year).toBe(2034);
  });

  it("calculates known test case correctly", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "male",
      preset: STANDARD_PRESET,
    });

    expect(result.pillars.year).toBe("己巳");
    expect(result.pillars.month).toBe("丁丑");
    expect(result.pillars.day).toBe("丁酉");
    expect(result.pillars.hour).toBe("丙午");
  });

  it("identifies day master in ten gods analysis", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "female",
      preset: STANDARD_PRESET,
    });

    expect(result.tenGods.dayMaster).toBe("丁");
    expect(result.tenGods.day.stem.tenGod).toBe("일간");
  });

  it("calculates major luck start age based on actual solar terms (not fixed 10)", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "male",
      preset: STANDARD_PRESET,
    });

    expect(result.majorLuck.startAge).not.toBe(10);
    expect(result.majorLuck.startAgeDetail).toBeDefined();
    expect(result.majorLuck.startAgeDetail.years).toBeGreaterThanOrEqual(0);
    expect(result.majorLuck.startAgeDetail.months).toBeGreaterThanOrEqual(0);
    expect(result.majorLuck.daysToTerm).toBeGreaterThan(0);
  });

  it("includes Jie (節) solar term info for major luck calculation", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 2024, month: 3, day: 15, hour: 12 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      gender: "female",
      preset: STANDARD_PRESET,
    });

    expect(result.solarTerms.prevJie).toBeDefined();
    expect(result.solarTerms.nextJie).toBeDefined();
    expect(result.solarTerms.prevJieMillis).toBeGreaterThan(0);
    expect(result.solarTerms.nextJieMillis).toBeGreaterThan(0);
    expect(result.solarTerms.prevJieDate).toBeDefined();
    expect(result.solarTerms.nextJieDate).toBeDefined();
  });
});
