import { describe, expect, it } from "vitest";
import { analyzeSinsals, SINSAL_INFO, SINSALS } from "../core/sinsals";

describe("sinsals", () => {
  describe("analyzeSinsals", () => {
    it("should detect peach blossom (도화살)", () => {
      const result = analyzeSinsals("甲寅", "丙寅", "戊卯", "庚午");

      const peachBlossoms = result.matches.filter((m) => m.sinsal === "peachBlossom");
      expect(peachBlossoms.length).toBeGreaterThan(0);
    });

    it("should detect sky horse (역마살)", () => {
      const result = analyzeSinsals("甲寅", "丙寅", "戊申", "庚午");

      const skyHorses = result.matches.filter((m) => m.sinsal === "skyHorse");
      expect(skyHorses.length).toBeGreaterThan(0);
    });

    it("should detect flowery canopy (화개살)", () => {
      const result = analyzeSinsals("甲寅", "丙戌", "戊子", "庚午");

      const floweryCanopies = result.matches.filter((m) => m.sinsal === "floweryCanopy");
      expect(floweryCanopies.length).toBeGreaterThan(0);
    });

    it("should return summary grouped by sinsal", () => {
      const result = analyzeSinsals("甲子", "丙寅", "戊辰", "庚午");

      expect(result.summary).toBeDefined();
      for (const [sinsal, positions] of Object.entries(result.summary)) {
        expect(SINSALS).toContain(sinsal);
        expect(Array.isArray(positions)).toBe(true);
      }
    });

    it("should not have duplicate matches", () => {
      const result = analyzeSinsals("甲子", "丙寅", "戊辰", "庚午");

      const seen = new Set<string>();
      for (const match of result.matches) {
        const key = `${match.sinsal}-${match.position}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    it("should detect sky noble (천을귀인)", () => {
      const result = analyzeSinsals("甲丑", "丙寅", "甲子", "庚午");

      const skyNobles = result.matches.filter((m) => m.sinsal === "skyNoble");
      expect(skyNobles.length).toBeGreaterThan(0);
    });
  });

  describe("SINSAL_INFO", () => {
    it("should have info for all sinsals", () => {
      for (const sinsal of SINSALS) {
        expect(SINSAL_INFO[sinsal]).toBeDefined();
        expect(SINSAL_INFO[sinsal].korean).toBeDefined();
        expect(SINSAL_INFO[sinsal].hanja).toBeDefined();
        expect(SINSAL_INFO[sinsal].meaning).toBeDefined();
        expect(["auspicious", "inauspicious", "neutral"]).toContain(SINSAL_INFO[sinsal].type);
      }
    });

    it("should have correct korean names", () => {
      expect(SINSAL_INFO.peachBlossom.korean).toBe("도화살");
      expect(SINSAL_INFO.skyHorse.korean).toBe("역마살");
      expect(SINSAL_INFO.skyNoble.korean).toBe("천을귀인");
    });

    it("should have correct type classifications", () => {
      expect(SINSAL_INFO.peachBlossom.type).toBe("neutral");
      expect(SINSAL_INFO.skyNoble.type).toBe("auspicious");
      expect(SINSAL_INFO.ghostGate.type).toBe("inauspicious");
    });
  });
});
