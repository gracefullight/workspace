import { describe, expect, it } from "vitest";
import { analyzeStrength } from "@/core/strength";

describe("strength", () => {
  describe("analyzeStrength", () => {
    it("returns a strength level", () => {
      const result = analyzeStrength("甲子", "丙寅", "甲辰", "乙亥");

      expect(result.level).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.factors).toBeDefined();
      expect(result.description).toBeDefined();
    });

    it("identifies 득령 when month supports day master", () => {
      // 甲木 day master in 寅月 (wood month) = 득령 (1.0 multiplier)
      const result = analyzeStrength("甲子", "丙寅", "甲辰", "乙亥");
      expect(result.factors.deukryeong).toBeGreaterThanOrEqual(0.7);
    });

    it("identifies 실령 when month does not support day master", () => {
      // 甲木 day master in 申月 (metal month) = 실령 (0.1 multiplier)
      const result = analyzeStrength("甲子", "庚申", "甲辰", "乙亥");
      expect(result.factors.deukryeong).toBeLessThanOrEqual(0.3);
    });

    it("calculates 득지 from day and hour branches", () => {
      const result = analyzeStrength("甲子", "丙寅", "甲寅", "甲寅");
      expect(result.factors.deukji).toBeGreaterThan(0);
    });

    it("calculates 득세 from year, month, hour stems", () => {
      const result = analyzeStrength("甲子", "甲寅", "甲辰", "甲寅");
      expect(result.factors.deukse).toBeGreaterThan(0);
    });

    it("returns 신강 for strong day master", () => {
      const result = analyzeStrength("甲子", "甲寅", "甲寅", "甲寅");
      expect(["신강", "태강", "극왕", "중화신강"]).toContain(result.level);
    });

    it("returns 신약 for weak day master", () => {
      const result = analyzeStrength("庚申", "庚申", "甲申", "庚申");
      expect(["신약", "태약", "극약", "중화신약"]).toContain(result.level);
    });

    it("includes description with day master info", () => {
      const result = analyzeStrength("甲子", "丙寅", "甲辰", "乙亥");
      expect(result.description).toContain("甲");
      expect(result.description).toContain("wood");
    });
  });
});
