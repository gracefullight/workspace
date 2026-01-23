import { describe, expect, it } from "vitest";
import type { MimicContext } from "@/core/context";
import { createDefaultState } from "@/core/state";
import { createI18n } from "@/lib/i18n";
import type { State } from "@/types";
import {
  analyzeTimeSinceLastSession,
  formatDuration,
  formatGrowAnalysis,
  formatJourney,
} from "@/utils/format";

const i18n = createI18n("en-US");
const ctx: MimicContext = { stateManager: {} as never, directory: "/tmp", i18n };

const mockState = (): State => {
  const state = createDefaultState("test-project");
  state.project.stack = ["TypeScript"];
  state.project.focus = "Refactoring";
  state.journey.sessionCount = 10;
  state.journey.observations = [
    { observation: "Observed something", timestamp: new Date().toISOString() },
  ];
  state.journey.milestones = [
    { milestone: "Achieved something", timestamp: new Date().toISOString() },
  ];
  state.patterns = [
    {
      id: "1",
      type: "tool",
      description: "read_file",
      count: 20,
      firstSeen: 0,
      lastSeen: 0,
      surfaced: false,
      examples: [],
    },
  ];
  state.evolution.capabilities = [
    {
      id: "c1",
      type: "command",
      name: "quick-read",
      description: "Quick read",
      createdAt: new Date().toISOString(),
    },
  ];
  state.statistics.totalSessions = 10;
  state.statistics.totalToolCalls = 100;
  state.statistics.filesModified = { "src/index.ts": 10, "src/utils.ts": 5 };

  return state;
};

describe("format", () => {
  describe("analyzeTimeSinceLastSession", () => {
    it("returns first-time if null", () => {
      expect(analyzeTimeSinceLastSession(null)).toBe("first-time");
    });

    it("returns continuing if < 1 hour", () => {
      const now = new Date();
      const last = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
      expect(analyzeTimeSinceLastSession(last)).toBe("continuing");
    });

    it("returns same-day if < 24 hours", () => {
      const now = new Date();
      const last = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
      expect(analyzeTimeSinceLastSession(last)).toBe("same-day");
    });

    it("returns short-break if < 72 hours", () => {
      const now = new Date();
      const last = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      expect(analyzeTimeSinceLastSession(last)).toBe("short-break");
    });

    it("returns week-break if < 168 hours", () => {
      const now = new Date();
      const last = new Date(now.getTime() - 100 * 60 * 60 * 1000).toISOString();
      expect(analyzeTimeSinceLastSession(last)).toBe("week-break");
    });

    it("returns long-break if >= 168 hours", () => {
      const now = new Date();
      const last = new Date(now.getTime() - 200 * 60 * 60 * 1000).toISOString();
      expect(analyzeTimeSinceLastSession(last)).toBe("long-break");
    });
  });

  describe("formatDuration", () => {
    it("formats minutes", () => {
      expect(formatDuration(10 * 60 * 1000)).toBe("10min");
    });

    it("formats hours and minutes", () => {
      expect(formatDuration(90 * 60 * 1000)).toBe("1h 30min");
    });
  });

  describe("formatJourney", () => {
    it("includes project name and stats", () => {
      const state = mockState();
      const result = formatJourney(ctx, state, ["commit 1"]);
      expect(result).toContain("test-project's Journey");
      expect(result).toContain("Sessions survived**: 10");
      expect(result).toContain("Treasures inside**: TypeScript");
      expect(result).toContain("Current hunt**: Refactoring");
      expect(result).toContain("Victories");
      expect(result).toContain("Achieved something");
      expect(result).toContain("Powers Absorbed");
      expect(result).toContain("quick-read");
      expect(result).toContain("Recent Scrolls");
      expect(result).toContain("commit 1");
    });
  });

  describe("formatGrowAnalysis", () => {
    it("formats analysis correctly", () => {
      const state = mockState();
      const result = formatGrowAnalysis(ctx, state, [], ["src/index.ts", "README.md"]);
      expect(result).toContain("Feeding Grounds");
      expect(result).toContain("src/index.ts");
      expect(result).toContain("Favorite Prey");
      expect(result).toContain("read_file");
      expect(result).toContain("Hunting Grounds");
      expect(result).toContain("src/");
      expect(result).toContain("./");
    });
  });
});
