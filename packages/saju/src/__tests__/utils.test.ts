import { describe, expect, it } from "vitest";
import {
  BRANCHES,
  dayPillarIndexFromJdn,
  ELEMENTS,
  getBranchIndex,
  getPillarIndex,
  getStemIndex,
  isYangStem,
  isYinStem,
  jdnFromDate,
  pillarFromIndex,
  STEMS,
} from "@/utils";

describe("constants", () => {
  describe("STEMS", () => {
    it("should have 10 stems", () => {
      expect(STEMS).toHaveLength(10);
    });

    it("should start with 甲 and end with 癸", () => {
      expect(STEMS[0]).toBe("甲");
      expect(STEMS[9]).toBe("癸");
    });
  });

  describe("BRANCHES", () => {
    it("should have 12 branches", () => {
      expect(BRANCHES).toHaveLength(12);
    });

    it("should start with 子 and end with 亥", () => {
      expect(BRANCHES[0]).toBe("子");
      expect(BRANCHES[11]).toBe("亥");
    });
  });

  describe("ELEMENTS", () => {
    it("should have 5 elements", () => {
      expect(ELEMENTS).toHaveLength(5);
    });

    it("should contain wood, fire, earth, metal, water", () => {
      expect(ELEMENTS).toContain("wood");
      expect(ELEMENTS).toContain("fire");
      expect(ELEMENTS).toContain("earth");
      expect(ELEMENTS).toContain("metal");
      expect(ELEMENTS).toContain("water");
    });
  });
});

describe("getStemIndex", () => {
  it("should return correct index for each stem", () => {
    expect(getStemIndex("甲")).toBe(0);
    expect(getStemIndex("乙")).toBe(1);
    expect(getStemIndex("癸")).toBe(9);
  });

  it("should return -1 for invalid stem", () => {
    expect(getStemIndex("X")).toBe(-1);
  });
});

describe("getBranchIndex", () => {
  it("should return correct index for each branch", () => {
    expect(getBranchIndex("子")).toBe(0);
    expect(getBranchIndex("丑")).toBe(1);
    expect(getBranchIndex("亥")).toBe(11);
  });

  it("should return -1 for invalid branch", () => {
    expect(getBranchIndex("X")).toBe(-1);
  });
});

describe("pillarFromIndex", () => {
  it("should return 甲子 for index 0", () => {
    expect(pillarFromIndex(0)).toBe("甲子");
  });

  it("should return 乙丑 for index 1", () => {
    expect(pillarFromIndex(1)).toBe("乙丑");
  });

  it("should handle negative indices", () => {
    expect(pillarFromIndex(-1)).toBe("癸亥");
  });

  it("should wrap around for indices >= 60", () => {
    expect(pillarFromIndex(60)).toBe("甲子");
    expect(pillarFromIndex(61)).toBe("乙丑");
  });
});

describe("getPillarIndex", () => {
  it("should return 0 for 甲子", () => {
    expect(getPillarIndex("甲子")).toBe(0);
  });

  it("should return correct index for 乙丑", () => {
    expect(getPillarIndex("乙丑")).toBe(1);
  });

  it("should be inverse of pillarFromIndex", () => {
    for (let i = 0; i < 60; i++) {
      const pillar = pillarFromIndex(i);
      expect(getPillarIndex(pillar)).toBe(i);
    }
  });
});

describe("jdnFromDate", () => {
  it("should return correct JDN for known date", () => {
    expect(jdnFromDate(2000, 1, 1)).toBe(2451545);
  });

  it("should return correct JDN for epoch date", () => {
    expect(jdnFromDate(1970, 1, 1)).toBe(2440588);
  });
});

describe("dayPillarIndexFromJdn", () => {
  it("should return value between 0 and 59", () => {
    const idx = dayPillarIndexFromJdn(2451545);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(60);
  });
});

describe("isYangStem", () => {
  it("should return true for yang stems", () => {
    expect(isYangStem("甲")).toBe(true);
    expect(isYangStem("丙")).toBe(true);
    expect(isYangStem("戊")).toBe(true);
    expect(isYangStem("庚")).toBe(true);
    expect(isYangStem("壬")).toBe(true);
  });

  it("should return false for yin stems", () => {
    expect(isYangStem("乙")).toBe(false);
    expect(isYangStem("丁")).toBe(false);
    expect(isYangStem("己")).toBe(false);
    expect(isYangStem("辛")).toBe(false);
    expect(isYangStem("癸")).toBe(false);
  });
});

describe("isYinStem", () => {
  it("should return true for yin stems", () => {
    expect(isYinStem("乙")).toBe(true);
    expect(isYinStem("丁")).toBe(true);
    expect(isYinStem("己")).toBe(true);
    expect(isYinStem("辛")).toBe(true);
    expect(isYinStem("癸")).toBe(true);
  });

  it("should return false for yang stems", () => {
    expect(isYinStem("甲")).toBe(false);
    expect(isYinStem("丙")).toBe(false);
    expect(isYinStem("戊")).toBe(false);
    expect(isYinStem("庚")).toBe(false);
    expect(isYinStem("壬")).toBe(false);
  });
});
