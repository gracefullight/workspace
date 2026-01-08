import { describe, it, expect } from "vitest";
import {
  analyzeRelations,
  findStemCombination,
  findBranchClash,
  findBranchSixCombination,
} from "@/core/relations";

describe("relations", () => {
  describe("findStemCombination", () => {
    it("finds 甲己 combination (earth)", () => {
      const result = findStemCombination("甲", "己");
      expect(result).not.toBeNull();
      expect(result?.resultElement).toBe("earth");
    });

    it("finds 乙庚 combination (metal)", () => {
      const result = findStemCombination("乙", "庚");
      expect(result).not.toBeNull();
      expect(result?.resultElement).toBe("metal");
    });

    it("returns null for non-combining stems", () => {
      const result = findStemCombination("甲", "乙");
      expect(result).toBeNull();
    });
  });

  describe("findBranchClash", () => {
    it("identifies 子午 clash", () => {
      expect(findBranchClash("子", "午")).toBe(true);
      expect(findBranchClash("午", "子")).toBe(true);
    });

    it("identifies 寅申 clash", () => {
      expect(findBranchClash("寅", "申")).toBe(true);
    });

    it("returns false for non-clashing branches", () => {
      expect(findBranchClash("子", "丑")).toBe(false);
    });
  });

  describe("findBranchSixCombination", () => {
    it("finds 子丑 combination (earth)", () => {
      const result = findBranchSixCombination("子", "丑");
      expect(result).not.toBeNull();
      expect(result?.resultElement).toBe("earth");
    });

    it("finds 寅亥 combination (wood)", () => {
      const result = findBranchSixCombination("寅", "亥");
      expect(result).not.toBeNull();
      expect(result?.resultElement).toBe("wood");
    });

    it("returns null for non-combining branches", () => {
      const result = findBranchSixCombination("子", "寅");
      expect(result).toBeNull();
    });
  });

  describe("analyzeRelations", () => {
    it("finds stem combinations in four pillars", () => {
      const result = analyzeRelations("甲子", "己丑", "丙寅", "辛亥");

      const stemCombos = result.combinations.filter((c) => c.type === "천간합");
      expect(stemCombos.length).toBeGreaterThan(0);
    });

    it("finds branch clashes in four pillars", () => {
      const result = analyzeRelations("甲子", "庚午", "丙寅", "壬申");

      expect(result.clashes.length).toBe(2);
    });

    it("finds 삼합 (triple combination)", () => {
      const result = analyzeRelations("甲寅", "丙午", "戊戌", "庚子");

      const tripleCombos = result.combinations.filter((c) => c.type === "삼합");
      expect(tripleCombos.length).toBeGreaterThan(0);
      expect(tripleCombos[0].resultElement).toBe("fire");
    });

    it("finds 육합 (six combination)", () => {
      const result = analyzeRelations("甲子", "乙丑", "丙寅", "丁卯");

      const sixCombos = result.combinations.filter((c) => c.type === "육합");
      expect(sixCombos.length).toBeGreaterThan(0);
    });

    it("finds 형 (punishment)", () => {
      const result = analyzeRelations("甲寅", "丙巳", "戊申", "庚子");

      expect(result.punishments.length).toBeGreaterThan(0);
      expect(result.punishments[0].punishmentType).toBe("무은지형");
    });

    it("aggregates all relations", () => {
      const result = analyzeRelations("甲子", "庚午", "丙寅", "壬申");

      expect(result.all.length).toBe(
        result.combinations.length +
          result.clashes.length +
          result.harms.length +
          result.punishments.length +
          result.destructions.length,
      );
    });
  });
});
