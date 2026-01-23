import { describe, expect, it } from "vitest";
import { createI18n } from "@/lib/i18n";
import {
  adaptMessage,
  formatGreeting,
  formatSuggestion,
  getLevelConfig,
} from "@/modules/evolution/system";
import type { State } from "@/types";

const i18n = createI18n("en-US");

const mockState = (level: State["project"]["creatorLevel"], sessionCount = 1): State => ({
  version: "0.0.0",
  project: {
    name: "test-project",
    creatorLevel: level,
    firstSession: 0,
  },
  journey: {
    observations: [],
    milestones: [],
    sessionCount,
    lastSession: null,
  },
  patterns: [],
  evolution: {
    capabilities: [],
    lastEvolution: null,
    pendingSuggestions: [],
  },
  preferences: {
    suggestionEnabled: true,
    learningEnabled: true,
    minPatternCount: 3,
  },
  statistics: {
    totalSessions: 0,
    totalToolCalls: 0,
    filesModified: {},
    lastSessionId: null,
  },
});

describe("level", () => {
  describe("getLevelConfig", () => {
    it("returns technical config for null level", () => {
      const config = getLevelConfig(null);
      expect(config.detailLevel).toBe("high");
      expect(config.useEmoji).toBe(false);
    });

    it("returns chaotic config", () => {
      const config = getLevelConfig("chaotic");
      expect(config.greetingStyle).toBe("chaotic");
    });
  });

  describe("adaptMessage", () => {
    it("strips headers for minimal style (technical)", () => {
      const state = mockState("technical");
      const msg = "## Hello\nWorld";
      // technical -> minimal greeting style
      const result = adaptMessage(msg, state);
      // adaptMessage implementation for minimal: message.replace(/^#+\s*/gm, "").trim()
      expect(result).toBe("Hello\nWorld");
    });

    it("adds emoji for chaotic style", () => {
      const state = mockState("chaotic");
      const msg = "Hello";
      const result = adaptMessage(msg, state);
      // chaotic adds an emoji prefix
      expect(result).toMatch(/^(🔥|⚡|🚀|💥|✨) Hello$/);
    });

    it("returns as is for others", () => {
      const state = mockState("non-technical");
      const msg = "Hello";
      expect(adaptMessage(msg, state)).toBe("Hello");
    });
  });

  describe("formatGreeting", () => {
    it("formats minimal greeting", () => {
      const state = mockState("technical", 5);
      expect(formatGreeting(i18n, state)).toBe("📦 test-project | s5 | p0");
    });

    it("formats casual greeting", () => {
      const state = mockState("semi-technical", 5);
      expect(formatGreeting(i18n, state)).toContain("Back to test-project");
    });

    it("formats formal greeting", () => {
      const state = mockState("non-technical", 5);
      expect(formatGreeting(i18n, state)).toContain("The chest opens...");
    });

    it("formats chaotic greeting", () => {
      const state = mockState("chaotic", 5);
      expect(formatGreeting(i18n, state)).toMatch(/📦 .* test-project! #5/);
    });
  });

  describe("formatSuggestion", () => {
    it("returns as is for technical terms", () => {
      const state = mockState("technical");
      const suggestion = "Use tool for pattern";
      expect(formatSuggestion(i18n, suggestion, state)).toBe("Use tool for pattern");
    });

    it("replaces technical terms for non-technical", () => {
      const state = mockState("non-technical");
      const suggestion = "Use tool for pattern hook";
      const result = formatSuggestion(i18n, suggestion, state);
      expect(result).toBe("Use shortcut for habit automation");
    });
  });
});
