import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectPatterns, surfacePatterns } from "@/patterns";
import { StateManager, createDefaultState } from "@/state";
import { getCommitMessages, detectCommitPatterns } from "@/git";
import { createI18n } from "@/i18n";

vi.mock("@/git", () => ({
  getCommitMessages: vi.fn(),
  detectCommitPatterns: vi.fn(),
}));

vi.mock("@/state", async () => {
  const actual = await vi.importActual<typeof import("@/state")>("@/state");
  return {
    ...actual,
    StateManager: vi.fn(),
  };
});

describe("patterns", () => {
  const i18n = createI18n("en-US");
  let manager: StateManager;

  beforeEach(() => {
    vi.clearAllMocks();
    (StateManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
      return {
        read: vi.fn(),
        save: vi.fn(),
      };
    });
    manager = new StateManager("/tmp/test");
  });

  describe("detectPatterns", () => {
    it("detects new commit patterns", async () => {
      const state = createDefaultState("test");
      vi.mocked(manager.read).mockResolvedValue(state);
      
      vi.mocked(getCommitMessages).mockReturnValue(["fix bug", "fix bug", "fix bug"]);
      vi.mocked(detectCommitPatterns).mockReturnValue(new Map([["fix bug", 3]]));

      const newPatterns = await detectPatterns({
        stateManager: manager,
        directory: "/tmp/test",
        i18n,
      });
      
      expect(newPatterns).toHaveLength(1);
      expect(newPatterns[0].type).toBe("commit");
      expect(newPatterns[0].description).toBe("fix bug");
      expect(newPatterns[0].count).toBe(3);
    });

    it("ignores existing patterns", async () => {
      const state = createDefaultState("test");
      state.patterns.push({
        id: "1",
        type: "commit",
        description: "fix bug",
        count: 5,
        firstSeen: 0,
        lastSeen: 0,
        surfaced: false,
        examples: [],
      });
      vi.mocked(manager.read).mockResolvedValue(state);
      
      vi.mocked(getCommitMessages).mockReturnValue(["fix bug"]);
      vi.mocked(detectCommitPatterns).mockReturnValue(new Map([["fix bug", 3]]));

      const newPatterns = await detectPatterns({
        stateManager: manager,
        directory: "/tmp/test",
        i18n,
      });
      expect(newPatterns).toHaveLength(0);
    });

    it("detects file patterns", async () => {
      const state = createDefaultState("test");
      state.statistics.filesModified = { "src/main.ts": 5 };
      vi.mocked(manager.read).mockResolvedValue(state);
      
      vi.mocked(detectCommitPatterns).mockReturnValue(new Map());

      const newPatterns = await detectPatterns({
        stateManager: manager,
        directory: "/tmp/test",
        i18n,
      });
      
      expect(newPatterns).toHaveLength(1);
      expect(newPatterns[0].type).toBe("file");
      expect(newPatterns[0].description).toBe("src/main.ts");
    });
  });

  describe("surfacePatterns", () => {
    it("surfaces unsurfaced patterns above threshold", async () => {
      const state = createDefaultState("test");
      state.patterns = [
        {
          id: "1",
          type: "tool",
          description: "my-tool",
          count: 5,
          firstSeen: 0,
          lastSeen: 0,
          surfaced: false,
          examples: [],
        },
        {
          id: "2",
          type: "file",
          description: "my-file",
          count: 2, // below threshold 3
          firstSeen: 0,
          lastSeen: 0,
          surfaced: false,
          examples: [],
        },
        {
          id: "3",
          type: "sequence",
          description: "A -> B",
          count: 5,
          firstSeen: 0,
          lastSeen: 0,
          surfaced: false,
          examples: [],
        },
        {
          id: "4",
          type: "commit",
          description: "fix",
          count: 5,
          firstSeen: 0,
          lastSeen: 0,
          surfaced: false,
          examples: [],
        },
        {
          id: "5",
          type: "file",
          description: "file.ts",
          count: 5,
          firstSeen: 0,
          lastSeen: 0,
          surfaced: false,
          examples: [],
        }
      ];
      vi.mocked(manager.read).mockResolvedValue(state);

      const suggestions = await surfacePatterns({
        stateManager: manager,
        directory: "/tmp/test",
        i18n,
      });
      expect(suggestions).toHaveLength(4); // tool, sequence, commit, file
      expect(suggestions.join("")).toContain("my-tool");
      expect(suggestions.join("")).toContain("A -> B");
    });

    it("ignores surfaced patterns", async () => {
      const state = createDefaultState("test");
      state.patterns = [
        {
          id: "1",
          type: "tool",
          description: "my-tool",
          count: 5,
          firstSeen: 0,
          lastSeen: 0,
          surfaced: true,
          examples: [],
        },
      ];
      vi.mocked(manager.read).mockResolvedValue(state);

      const suggestions = await surfacePatterns({
        stateManager: manager,
        directory: "/tmp/test",
        i18n,
      });
      expect(suggestions).toHaveLength(0);
    });
  });
});
