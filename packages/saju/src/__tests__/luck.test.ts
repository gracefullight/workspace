import { describe, it, expect } from "vitest";
import { calculateYearlyLuck, getYearPillar } from "@/core/luck";

describe("luck", () => {
  describe("getYearPillar", () => {
    it("returns correct pillar for 1984 (甲子)", () => {
      expect(getYearPillar(1984)).toBe("甲子");
    });

    it("returns correct pillar for 2024 (甲辰)", () => {
      expect(getYearPillar(2024)).toBe("甲辰");
    });

    it("returns correct pillar for 2000 (庚辰)", () => {
      expect(getYearPillar(2000)).toBe("庚辰");
    });
  });

  describe("calculateYearlyLuck", () => {
    it("calculates yearly luck for a range", () => {
      const result = calculateYearlyLuck(1990, 2020, 2025);

      expect(result).toHaveLength(6);
      expect(result[0].year).toBe(2020);
      expect(result[5].year).toBe(2025);
    });

    it("includes correct age calculation", () => {
      const result = calculateYearlyLuck(1990, 2020, 2020);

      expect(result[0].age).toBe(31);
    });

    it("returns pillar, stem, and branch for each year", () => {
      const result = calculateYearlyLuck(1990, 2024, 2024);

      expect(result[0].pillar).toBe("甲辰");
      expect(result[0].stem).toBe("甲");
      expect(result[0].branch).toBe("辰");
    });
  });
});
