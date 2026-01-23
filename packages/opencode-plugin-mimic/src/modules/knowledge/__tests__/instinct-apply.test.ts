import { describe, expect, it } from "vitest";
import { detectCurrentDomain, filterRelevantInstincts } from "@/modules/knowledge/instinct-apply";
import type { Instinct } from "@/types";

describe("instinct-apply", () => {
  describe("detectCurrentDomain", () => {
    it("detects testing domain from test-related tools", () => {
      const domains = detectCurrentDomain(["vitest", "jest"], []);
      expect(domains).toContain("testing");
    });

    it("detects git domain from git-related tools", () => {
      const domains = detectCurrentDomain(["git-commit", "push"], []);
      expect(domains).toContain("git");
    });

    it("detects domain from file names", () => {
      const domains = detectCurrentDomain([], ["test.spec.ts", "debug.log"]);
      expect(domains).toContain("testing");
      expect(domains).toContain("debugging");
    });

    it("returns other for unknown context", () => {
      const domains = detectCurrentDomain(["unknown-action"], ["random.xyz"]);
      expect(domains).toContain("other");
    });
  });

  describe("filterRelevantInstincts", () => {
    const createInstinct = (domain: string, confidence: number): Instinct => ({
      id: `id-${domain}`,
      title: `Test ${domain}`,
      description: `Description for ${domain}`,
      domain: domain as Instinct["domain"],
      confidence,
      status: "approved",
      source: "personal",
      createdAt: new Date().toISOString(),
      evidence: { patternIDs: [] },
    });

    it("filters instincts matching current domains", () => {
      const instincts = [
        createInstinct("testing", 0.8),
        createInstinct("git", 0.7),
        createInstinct("debugging", 0.6),
      ];

      const result = filterRelevantInstincts(instincts, ["testing"]);
      expect(result).toHaveLength(1);
      expect(result[0].instinct.domain).toBe("testing");
    });

    it("excludes low confidence instincts", () => {
      const instincts = [createInstinct("testing", 0.3), createInstinct("testing", 0.8)];

      const result = filterRelevantInstincts(instincts, ["testing"]);
      expect(result).toHaveLength(1);
      expect(result[0].instinct.confidence).toBe(0.8);
    });

    it("assigns correct relevance based on confidence", () => {
      const instincts = [
        createInstinct("testing", 0.9),
        createInstinct("testing", 0.7),
        createInstinct("testing", 0.55),
      ];

      const result = filterRelevantInstincts(instincts, ["testing"]);
      expect(result[0].relevance).toBe("high");
      expect(result[1].relevance).toBe("medium");
      expect(result[2].relevance).toBe("low");
    });

    it("limits to 3 results", () => {
      const instincts = [
        createInstinct("testing", 0.9),
        createInstinct("testing", 0.85),
        createInstinct("testing", 0.8),
        createInstinct("testing", 0.75),
        createInstinct("testing", 0.7),
      ];

      const result = filterRelevantInstincts(instincts, ["testing"]);
      expect(result).toHaveLength(3);
    });
  });
});
