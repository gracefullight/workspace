import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { createLuxonAdapter } from "@/adapters/luxon";
import { getSaju, STANDARD_PRESET } from "@/index";

describe("getSaju integration", () => {
  it("returns complete saju analysis", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
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
  });

  it("includes major luck when gender is provided", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      preset: STANDARD_PRESET,
      gender: "male",
      includeMajorLuck: true,
    });

    expect(result.majorLuck).toBeDefined();
    expect(result.majorLuck?.pillars.length).toBeGreaterThan(0);
  });

  it("includes yearly luck when range is provided", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
      preset: STANDARD_PRESET,
      yearlyLuckRange: { from: 2024, to: 2026 },
    });

    expect(result.yearlyLuck).toBeDefined();
    expect(result.yearlyLuck?.length).toBe(3);
  });

  it("calculates known test case correctly", async () => {
    const adapter = await createLuxonAdapter();
    const dt = DateTime.fromObject(
      { year: 1990, month: 2, day: 1, hour: 12, minute: 10 },
      { zone: "Asia/Seoul" },
    );

    const result = getSaju(adapter, dt, {
      longitudeDeg: 126.9778,
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
      preset: STANDARD_PRESET,
    });

    expect(result.tenGods.dayMaster).toBe("丁");
    expect(result.tenGods.day.stem.tenGod).toBe("일간");
  });
});
