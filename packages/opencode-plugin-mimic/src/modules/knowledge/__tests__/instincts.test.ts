import { describe, expect, it } from "vitest";
import {
  generateInstinctId,
  getEligibleDomains,
  groupByDomain,
  normalizeDomain,
  shouldTriggerEvolution,
} from "@/modules/knowledge/instincts";
import type { Instinct } from "@/types";

describe("instincts", () => {
  describe("generateInstinctId", () => {
    it("generates consistent hash from domain and title", () => {
      const id1 = generateInstinctId("testing", "Always run tests");
      const id2 = generateInstinctId("testing", "Always run tests");
      expect(id1).toBe(id2);
      expect(id1).toHaveLength(12);
    });

    it("generates different hash for different inputs", () => {
      const id1 = generateInstinctId("testing", "Always run tests");
      const id2 = generateInstinctId("git", "Always run tests");
      expect(id1).not.toBe(id2);
    });
  });

  describe("normalizeDomain", () => {
    it("normalizes known synonyms", () => {
      expect(normalizeDomain("test")).toBe("testing");
      expect(normalizeDomain("tests")).toBe("testing");
      expect(normalizeDomain("debug")).toBe("debugging");
      expect(normalizeDomain("docs")).toBe("documentation");
      expect(normalizeDomain("tools")).toBe("tooling");
      expect(normalizeDomain("refactor")).toBe("refactoring");
    });

    it("returns exact domain if valid", () => {
      expect(normalizeDomain("testing")).toBe("testing");
      expect(normalizeDomain("git")).toBe("git");
      expect(normalizeDomain("code-style")).toBe("code-style");
    });

    it("returns 'other' for unknown domains", () => {
      expect(normalizeDomain("unknown")).toBe("other");
      expect(normalizeDomain("random")).toBe("other");
    });

    it("is case insensitive", () => {
      expect(normalizeDomain("TESTING")).toBe("testing");
      expect(normalizeDomain("Git")).toBe("git");
    });
  });

  describe("groupByDomain", () => {
    const createInstinct = (
      domain: string,
      status: "approved" | "pending" = "approved",
      confidence = 0.7,
    ): Instinct => ({
      id: `id-${domain}-${Math.random()}`,
      title: `Test ${domain}`,
      description: `Description for ${domain}`,
      domain: domain as Instinct["domain"],
      confidence,
      status,
      source: "personal",
      createdAt: new Date().toISOString(),
      evidence: { patternIDs: [] },
    });

    it("groups approved instincts by domain", () => {
      const instincts = [
        createInstinct("testing"),
        createInstinct("testing"),
        createInstinct("git"),
      ];

      const grouped = groupByDomain(instincts);
      expect(grouped.get("testing")).toHaveLength(2);
      expect(grouped.get("git")).toHaveLength(1);
    });

    it("excludes non-approved instincts", () => {
      const instincts = [createInstinct("testing", "pending"), createInstinct("testing")];

      const grouped = groupByDomain(instincts);
      expect(grouped.get("testing")).toHaveLength(1);
    });

    it("excludes low confidence instincts", () => {
      const instincts = [createInstinct("testing", "approved", 0.5), createInstinct("testing")];

      const grouped = groupByDomain(instincts);
      expect(grouped.get("testing")).toHaveLength(1);
    });
  });

  describe("getEligibleDomains", () => {
    it("returns domains with 5+ instincts", () => {
      const map = new Map<Instinct["domain"], Instinct[]>();
      map.set(
        "testing",
        Array(5)
          .fill(null)
          .map(() => ({}) as Instinct),
      );
      map.set(
        "git",
        Array(3)
          .fill(null)
          .map(() => ({}) as Instinct),
      );

      const eligible = getEligibleDomains(map);
      expect(eligible).toContain("testing");
      expect(eligible).not.toContain("git");
    });
  });

  describe("shouldTriggerEvolution", () => {
    it("returns true if domain has not evolved", () => {
      expect(shouldTriggerEvolution("testing", undefined)).toBe(true);
      expect(shouldTriggerEvolution("testing", {})).toBe(true);
    });

    it("returns false if evolved recently", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(shouldTriggerEvolution("testing", { testing: yesterday.toISOString() })).toBe(false);
    });

    it("returns true if evolved beyond cooldown", () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      expect(shouldTriggerEvolution("testing", { testing: eightDaysAgo.toISOString() })).toBe(true);
    });
  });
});
