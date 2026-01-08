import { describe, it, expect } from "vitest";
import {
  getTenGod,
  getStemElement,
  getStemPolarity,
  getBranchElement,
  getHiddenStems,
  analyzeTenGods,
  countTenGods,
  countElements,
} from "@/core/ten-gods";

describe("ten-gods", () => {
  describe("getStemElement", () => {
    it("returns correct element for each stem", () => {
      expect(getStemElement("甲")).toBe("wood");
      expect(getStemElement("乙")).toBe("wood");
      expect(getStemElement("丙")).toBe("fire");
      expect(getStemElement("丁")).toBe("fire");
      expect(getStemElement("戊")).toBe("earth");
      expect(getStemElement("己")).toBe("earth");
      expect(getStemElement("庚")).toBe("metal");
      expect(getStemElement("辛")).toBe("metal");
      expect(getStemElement("壬")).toBe("water");
      expect(getStemElement("癸")).toBe("water");
    });
  });

  describe("getStemPolarity", () => {
    it("returns correct polarity for each stem", () => {
      expect(getStemPolarity("甲")).toBe("yang");
      expect(getStemPolarity("乙")).toBe("yin");
      expect(getStemPolarity("丙")).toBe("yang");
      expect(getStemPolarity("丁")).toBe("yin");
    });
  });

  describe("getBranchElement", () => {
    it("returns correct element for each branch", () => {
      expect(getBranchElement("子")).toBe("water");
      expect(getBranchElement("丑")).toBe("earth");
      expect(getBranchElement("寅")).toBe("wood");
      expect(getBranchElement("卯")).toBe("wood");
      expect(getBranchElement("午")).toBe("fire");
      expect(getBranchElement("酉")).toBe("metal");
    });
  });

  describe("getHiddenStems", () => {
    it("returns correct hidden stems for each branch", () => {
      expect(getHiddenStems("子")).toEqual(["癸"]);
      expect(getHiddenStems("丑")).toEqual(["己", "癸", "辛"]);
      expect(getHiddenStems("寅")).toEqual(["甲", "丙", "戊"]);
      expect(getHiddenStems("卯")).toEqual(["乙"]);
      expect(getHiddenStems("午")).toEqual(["丁", "己"]);
    });
  });

  describe("getTenGod", () => {
    it("correctly identifies 비견 (same element, same polarity)", () => {
      expect(getTenGod("甲", "甲")).toBe("비견");
      expect(getTenGod("乙", "乙")).toBe("비견");
    });

    it("correctly identifies 겁재 (same element, different polarity)", () => {
      expect(getTenGod("甲", "乙")).toBe("겁재");
      expect(getTenGod("乙", "甲")).toBe("겁재");
    });

    it("correctly identifies 식신 (I generate, same polarity)", () => {
      expect(getTenGod("甲", "丙")).toBe("식신");
      expect(getTenGod("丙", "戊")).toBe("식신");
    });

    it("correctly identifies 상관 (I generate, different polarity)", () => {
      expect(getTenGod("甲", "丁")).toBe("상관");
      expect(getTenGod("丙", "己")).toBe("상관");
    });

    it("correctly identifies 편재 (I control, same polarity)", () => {
      expect(getTenGod("甲", "戊")).toBe("편재");
      expect(getTenGod("丙", "庚")).toBe("편재");
    });

    it("correctly identifies 정재 (I control, different polarity)", () => {
      expect(getTenGod("甲", "己")).toBe("정재");
      expect(getTenGod("丙", "辛")).toBe("정재");
    });

    it("correctly identifies 편관 (controls me, same polarity)", () => {
      expect(getTenGod("甲", "庚")).toBe("편관");
      expect(getTenGod("丙", "壬")).toBe("편관");
    });

    it("correctly identifies 정관 (controls me, different polarity)", () => {
      expect(getTenGod("甲", "辛")).toBe("정관");
      expect(getTenGod("丙", "癸")).toBe("정관");
    });

    it("correctly identifies 편인 (generates me, same polarity)", () => {
      expect(getTenGod("甲", "壬")).toBe("편인");
      expect(getTenGod("丙", "甲")).toBe("편인");
    });

    it("correctly identifies 정인 (generates me, different polarity)", () => {
      expect(getTenGod("甲", "癸")).toBe("정인");
      expect(getTenGod("丙", "乙")).toBe("정인");
    });
  });

  describe("analyzeTenGods", () => {
    it("analyzes four pillars correctly", () => {
      const result = analyzeTenGods("甲子", "丙寅", "甲辰", "乙亥");

      expect(result.dayMaster).toBe("甲");
      expect(result.year.stem.tenGod).toBe("비견");
      expect(result.month.stem.tenGod).toBe("식신");
      expect(result.day.stem.tenGod).toBe("일간");
      expect(result.hour.stem.tenGod).toBe("겁재");
    });

    it("includes hidden stems analysis", () => {
      const result = analyzeTenGods("甲子", "丙寅", "甲辰", "乙亥");

      expect(result.year.branch.hiddenStems).toHaveLength(1);
      expect(result.year.branch.hiddenStems[0].stem).toBe("癸");
      expect(result.month.branch.hiddenStems).toHaveLength(3);
    });
  });

  describe("countTenGods", () => {
    it("counts ten gods correctly", () => {
      const analysis = analyzeTenGods("甲子", "丙寅", "甲辰", "乙亥");
      const counts = countTenGods(analysis);

      expect(counts["비견"]).toBeGreaterThanOrEqual(1);
      expect(counts["식신"]).toBeGreaterThanOrEqual(1);
    });
  });

  describe("countElements", () => {
    it("counts elements correctly", () => {
      const analysis = analyzeTenGods("甲子", "丙寅", "甲辰", "乙亥");
      const counts = countElements(analysis);

      expect(counts.wood).toBeGreaterThanOrEqual(3);
      expect(counts.fire).toBeGreaterThanOrEqual(1);
    });
  });
});
