import { describe, expect, it } from "vitest";
import {
  analyzeTwelveStages,
  getTwelveStage,
  STAGE_INFO,
  TWELVE_STAGES,
} from "../core/twelve-stages";

describe("twelve-stages", () => {
  describe("getTwelveStage", () => {
    it("should return longLife for 甲 at 亥", () => {
      expect(getTwelveStage("甲", "亥")).toBe("longLife");
    });

    it("should return imperial for 甲 at 卯", () => {
      expect(getTwelveStage("甲", "卯")).toBe("imperial");
    });

    it("should return tomb for 甲 at 未", () => {
      expect(getTwelveStage("甲", "未")).toBe("tomb");
    });

    it("should return longLife for 乙 at 午", () => {
      expect(getTwelveStage("乙", "午")).toBe("longLife");
    });

    it("should return imperial for 乙 at 寅", () => {
      expect(getTwelveStage("乙", "寅")).toBe("imperial");
    });

    it("should return longLife for 丙 at 寅", () => {
      expect(getTwelveStage("丙", "寅")).toBe("longLife");
    });

    it("should return imperial for 丙 at 午", () => {
      expect(getTwelveStage("丙", "午")).toBe("imperial");
    });

    it("should return longLife for 庚 at 巳", () => {
      expect(getTwelveStage("庚", "巳")).toBe("longLife");
    });

    it("should return imperial for 庚 at 酉", () => {
      expect(getTwelveStage("庚", "酉")).toBe("imperial");
    });

    it("should return longLife for 壬 at 申", () => {
      expect(getTwelveStage("壬", "申")).toBe("longLife");
    });

    it("should return imperial for 壬 at 子", () => {
      expect(getTwelveStage("壬", "子")).toBe("imperial");
    });

    it("should throw error for invalid stem", () => {
      expect(() => getTwelveStage("X", "子")).toThrow("Invalid stem: X");
    });

    it("should throw error for invalid branch", () => {
      expect(() => getTwelveStage("甲", "X")).toThrow("Invalid branch: X");
    });
  });

  describe("analyzeTwelveStages", () => {
    it("should analyze all four pillars", () => {
      const result = analyzeTwelveStages("甲子", "丙寅", "戊辰", "庚午");

      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
      expect(TWELVE_STAGES).toContain(result.year);
      expect(TWELVE_STAGES).toContain(result.month);
      expect(TWELVE_STAGES).toContain(result.day);
      expect(TWELVE_STAGES).toContain(result.hour);
    });

    it("should correctly analyze 戊 day master", () => {
      const result = analyzeTwelveStages("甲子", "丙寅", "戊辰", "庚午");

      expect(result.month).toBe("longLife");
      expect(result.hour).toBe("imperial");
    });
  });

  describe("STAGE_INFO", () => {
    it("should have info for all twelve stages", () => {
      for (const stage of TWELVE_STAGES) {
        expect(STAGE_INFO[stage]).toBeDefined();
        expect(STAGE_INFO[stage].korean).toBeDefined();
        expect(STAGE_INFO[stage].hanja).toBeDefined();
        expect(STAGE_INFO[stage].meaning).toBeDefined();
        expect(["strong", "neutral", "weak"]).toContain(STAGE_INFO[stage].strength);
      }
    });

    it("should have correct korean names", () => {
      expect(STAGE_INFO.longLife.korean).toBe("장생");
      expect(STAGE_INFO.bathing.korean).toBe("목욕");
      expect(STAGE_INFO.imperial.korean).toBe("제왕");
      expect(STAGE_INFO.death.korean).toBe("사");
    });

    it("should have correct strength classifications", () => {
      expect(STAGE_INFO.longLife.strength).toBe("strong");
      expect(STAGE_INFO.imperial.strength).toBe("strong");
      expect(STAGE_INFO.decline.strength).toBe("weak");
      expect(STAGE_INFO.tomb.strength).toBe("neutral");
    });
  });
});
