import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MimicContext } from "@/core/context";
import type { StateManager } from "@/core/state";
import { shouldRunObserver } from "@/modules/observation/observer";
import type { State } from "@/types";

describe("observer", () => {
  describe("shouldRunObserver", () => {
    let mockStateManager: Partial<StateManager>;
    let mockState: State;
    let ctx: MimicContext;

    beforeEach(() => {
      mockState = {
        version: "0.1.0",
        project: {
          name: "test",
          creatorLevel: null,
          firstSession: Date.now(),
        },
        journey: {
          observations: [],
          milestones: [],
          sessionCount: 1,
          lastSession: null,
        },
        patterns: [],
        evolution: {
          capabilities: [],
          lastEvolution: null,
          pendingSuggestions: [],
          lastObserverRun: null,
          evolvedDomains: {},
          instinctIndex: {},
        },
        preferences: {
          suggestionEnabled: true,
          learningEnabled: true,
          minPatternCount: 3,
        },
        statistics: {
          totalSessions: 1,
          totalToolCalls: 0,
          filesModified: {},
          lastSessionId: null,
        },
      };

      mockStateManager = {
        read: vi.fn().mockResolvedValue(mockState),
      };

      ctx = {
        stateManager: mockStateManager as StateManager,
        directory: "/tmp/test",
        i18n: { language: "en-US", t: (key: string) => key },
      } as unknown as MimicContext;
    });

    it("returns false if learning disabled", async () => {
      mockState.preferences.learningEnabled = false;
      expect(await shouldRunObserver(ctx)).toBe(false);
    });

    it("returns true if never run before", async () => {
      mockState.evolution.lastObserverRun = null;
      expect(await shouldRunObserver(ctx)).toBe(true);
    });

    it("returns false if run recently", async () => {
      mockState.evolution.lastObserverRun = new Date().toISOString();
      expect(await shouldRunObserver(ctx)).toBe(false);
    });

    it("returns true if cooldown elapsed", async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      mockState.evolution.lastObserverRun = fifteenMinutesAgo.toISOString();
      expect(await shouldRunObserver(ctx)).toBe(true);
    });
  });
});
