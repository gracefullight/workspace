import { describe, expect, it } from "vitest";
import {
  analyzeTenGods,
  countElements,
  countTenGods,
  getBranchElement,
  getHiddenStems,
  getStemElement,
  getStemPolarity,
  getTenGodKey,
  getTenGodLabel,
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

  describe("getTenGodKey", () => {
    it("correctly identifies companion (same element, same polarity)", () => {
      expect(getTenGodKey("甲", "甲")).toBe("companion");
      expect(getTenGodKey("乙", "乙")).toBe("companion");
    });

    it("correctly identifies robWealth (same element, different polarity)", () => {
      expect(getTenGodKey("甲", "乙")).toBe("robWealth");
      expect(getTenGodKey("乙", "甲")).toBe("robWealth");
    });

    it("correctly identifies eatingGod (I generate, same polarity)", () => {
      expect(getTenGodKey("甲", "丙")).toBe("eatingGod");
      expect(getTenGodKey("丙", "戊")).toBe("eatingGod");
    });

    it("correctly identifies hurtingOfficer (I generate, different polarity)", () => {
      expect(getTenGodKey("甲", "丁")).toBe("hurtingOfficer");
      expect(getTenGodKey("丙", "己")).toBe("hurtingOfficer");
    });

    it("correctly identifies indirectWealth (I control, same polarity)", () => {
      expect(getTenGodKey("甲", "戊")).toBe("indirectWealth");
      expect(getTenGodKey("丙", "庚")).toBe("indirectWealth");
    });

    it("correctly identifies directWealth (I control, different polarity)", () => {
      expect(getTenGodKey("甲", "己")).toBe("directWealth");
      expect(getTenGodKey("丙", "辛")).toBe("directWealth");
    });

    it("correctly identifies sevenKillings (controls me, same polarity)", () => {
      expect(getTenGodKey("甲", "庚")).toBe("sevenKillings");
      expect(getTenGodKey("丙", "壬")).toBe("sevenKillings");
    });

    it("correctly identifies directOfficer (controls me, different polarity)", () => {
      expect(getTenGodKey("甲", "辛")).toBe("directOfficer");
      expect(getTenGodKey("丙", "癸")).toBe("directOfficer");
    });

    it("correctly identifies indirectSeal (generates me, same polarity)", () => {
      expect(getTenGodKey("甲", "壬")).toBe("indirectSeal");
      expect(getTenGodKey("丙", "甲")).toBe("indirectSeal");
    });

    it("correctly identifies directSeal (generates me, different polarity)", () => {
      expect(getTenGodKey("甲", "癸")).toBe("directSeal");
      expect(getTenGodKey("丙", "乙")).toBe("directSeal");
    });
  });

  describe("getTenGodLabel", () => {
    it("returns correct Korean labels", () => {
      expect(getTenGodLabel("companion").korean).toBe("비견");
      expect(getTenGodLabel("robWealth").korean).toBe("겁재");
      expect(getTenGodLabel("eatingGod").korean).toBe("식신");
      expect(getTenGodLabel("hurtingOfficer").korean).toBe("상관");
      expect(getTenGodLabel("indirectWealth").korean).toBe("편재");
      expect(getTenGodLabel("directWealth").korean).toBe("정재");
      expect(getTenGodLabel("sevenKillings").korean).toBe("편관");
      expect(getTenGodLabel("directOfficer").korean).toBe("정관");
      expect(getTenGodLabel("indirectSeal").korean).toBe("편인");
      expect(getTenGodLabel("directSeal").korean).toBe("정인");
    });
  });

  describe("analyzeTenGods", () => {
    it("analyzes four pillars correctly", () => {
      const result = analyzeTenGods("甲子", "丙寅", "甲辰", "乙亥");

      expect(result.dayMaster).toBe("甲");
      expect(result.year.stem.tenGod.key).toBe("companion");
      expect(result.month.stem.tenGod.key).toBe("eatingGod");
      expect(result.day.stem.tenGod.key).toBe("dayMaster");
      expect(result.hour.stem.tenGod.key).toBe("robWealth");
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

      expect(counts.companion).toBeGreaterThanOrEqual(1);
      expect(counts.eatingGod).toBeGreaterThanOrEqual(1);
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
