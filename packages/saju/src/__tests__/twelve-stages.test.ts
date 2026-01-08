import { describe, expect, it } from "vitest";
import { analyzeTwelveStages, getTwelveStageLabel, TWELVE_STAGES } from "../core/twelve-stages";

describe("twelve-stages", () => {
  describe("analyzeTwelveStages", () => {
    it("should analyze all four pillars", () => {
      const result = analyzeTwelveStages("甲子", "丙寅", "戊辰", "庚午");

      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
      expect(TWELVE_STAGES).toContain(result.year.key);
      expect(TWELVE_STAGES).toContain(result.month.key);
      expect(TWELVE_STAGES).toContain(result.day.key);
      expect(TWELVE_STAGES).toContain(result.hour.key);
    });

    it("should correctly analyze 戊 day master", () => {
      const result = analyzeTwelveStages("甲子", "丙寅", "戊辰", "庚午");

      expect(result.month.key).toBe("longLife");
      expect(result.hour.key).toBe("imperial");
    });

    it("should return longLife for 甲 at 亥", () => {
      const result = analyzeTwelveStages("甲亥", "甲亥", "甲亥", "甲亥");
      expect(result.year.key).toBe("longLife");
    });

    it("should return imperial for 甲 at 卯", () => {
      const result = analyzeTwelveStages("甲卯", "甲卯", "甲卯", "甲卯");
      expect(result.year.key).toBe("imperial");
    });

    it("should return tomb for 甲 at 未", () => {
      const result = analyzeTwelveStages("甲未", "甲未", "甲未", "甲未");
      expect(result.year.key).toBe("tomb");
    });

    it("should return longLife for 乙 at 午", () => {
      const result = analyzeTwelveStages("乙午", "乙午", "乙午", "乙午");
      expect(result.year.key).toBe("longLife");
    });

    it("should return imperial for 乙 at 寅", () => {
      const result = analyzeTwelveStages("乙寅", "乙寅", "乙寅", "乙寅");
      expect(result.year.key).toBe("imperial");
    });

    it("should return longLife for 丙 at 寅", () => {
      const result = analyzeTwelveStages("丙寅", "丙寅", "丙寅", "丙寅");
      expect(result.year.key).toBe("longLife");
    });

    it("should return imperial for 丙 at 午", () => {
      const result = analyzeTwelveStages("丙午", "丙午", "丙午", "丙午");
      expect(result.year.key).toBe("imperial");
    });

    it("should return longLife for 庚 at 巳", () => {
      const result = analyzeTwelveStages("庚巳", "庚巳", "庚巳", "庚巳");
      expect(result.year.key).toBe("longLife");
    });

    it("should return imperial for 庚 at 酉", () => {
      const result = analyzeTwelveStages("庚酉", "庚酉", "庚酉", "庚酉");
      expect(result.year.key).toBe("imperial");
    });

    it("should return longLife for 壬 at 申", () => {
      const result = analyzeTwelveStages("壬申", "壬申", "壬申", "壬申");
      expect(result.year.key).toBe("longLife");
    });

    it("should return imperial for 壬 at 子", () => {
      const result = analyzeTwelveStages("壬子", "壬子", "壬子", "壬子");
      expect(result.year.key).toBe("imperial");
    });
  });

  describe("getTwelveStageLabel", () => {
    it("should have info for all twelve stages", () => {
      for (const stage of TWELVE_STAGES) {
        const label = getTwelveStageLabel(stage);
        expect(label.key).toBe(stage);
        expect(label.korean).toBeDefined();
        expect(label.hanja).toBeDefined();
        expect(label.meaning).toBeDefined();
        expect(["strong", "neutral", "weak"]).toContain(label.strength);
      }
    });

    it("should have correct korean names", () => {
      expect(getTwelveStageLabel("longLife").korean).toBe("장생");
      expect(getTwelveStageLabel("bathing").korean).toBe("목욕");
      expect(getTwelveStageLabel("imperial").korean).toBe("제왕");
      expect(getTwelveStageLabel("death").korean).toBe("사");
    });

    it("should have correct strength classifications", () => {
      expect(getTwelveStageLabel("longLife").strength).toBe("strong");
      expect(getTwelveStageLabel("imperial").strength).toBe("strong");
      expect(getTwelveStageLabel("decline").strength).toBe("weak");
      expect(getTwelveStageLabel("tomb").strength).toBe("neutral");
    });
  });
});
