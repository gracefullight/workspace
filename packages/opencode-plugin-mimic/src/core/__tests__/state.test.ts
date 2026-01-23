import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultState, StateManager } from "@/core/state";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

describe("StateManager", () => {
  const testDir = "/tmp/test-project";
  let manager: StateManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new StateManager(testDir);
  });

  describe("initialize", () => {
    it("creates directories and default state if not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      await manager.initialize();

      expect(mkdir).toHaveBeenCalledTimes(3); // mimic, sessions, instincts
      expect(writeFile).toHaveBeenCalledTimes(2);

      const gitIgnoreCall = vi.mocked(writeFile).mock.calls[0];
      expect(gitIgnoreCall[0]).toContain(".gitignore");
      expect(gitIgnoreCall[1]).toContain(".opencode/mimic/");

      const stateCall = vi.mocked(writeFile).mock.calls[1];
      const writtenState = JSON.parse(stateCall[1] as string);
      expect(writtenState.project.name).toBe("test-project");
    });

    it("does not create if exists", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(".opencode/mimic/\n");
      await manager.initialize();
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe("ensureGitIgnore", () => {
    it("creates .gitignore with mimic wildcard line if file does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      await manager["ensureGitIgnore"]();

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".gitignore"),
        ".opencode/mimic/\n",
        "utf-8",
      );
    });

    it("appends mimic wildcard line to existing .gitignore if not present", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue("node_modules/\n.env\n");
      await manager["ensureGitIgnore"]();

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".gitignore"),
        "node_modules/\n.env\n\n.opencode/mimic/\n",
        "utf-8",
      );
    });

    it("does not append if mimic wildcard line already exists", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(".opencode/mimic/\n");
      await manager["ensureGitIgnore"]();

      expect(writeFile).not.toHaveBeenCalled();
    });

    it("ignores whitespace when checking for existing entry", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue("  .opencode/mimic/  \n");
      await manager["ensureGitIgnore"]();

      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe("read", () => {
    it("reads and parses state", async () => {
      const mockData = createDefaultState("test");
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockData));

      const state = await manager.read();
      expect(state).toEqual(mockData);
    });
  });

  describe("addObservation", () => {
    it("adds observation and saves", async () => {
      const mockData = createDefaultState("test");
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockData));

      await manager.addObservation("test observation");

      expect(writeFile).toHaveBeenCalled();
      const callArgs = vi.mocked(writeFile).mock.calls[0];
      const writtenState = JSON.parse(callArgs[1] as string);
      expect(writtenState.journey.observations).toHaveLength(1);
      expect(writtenState.journey.observations[0].observation).toBe("test observation");
    });

    it("trims observations to 100", async () => {
      const mockData = createDefaultState("test");
      mockData.journey.observations = Array(100).fill({ observation: "old", timestamp: "" });
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockData));

      await manager.addObservation("new");

      const callArgs = vi.mocked(writeFile).mock.calls[0];
      const writtenState = JSON.parse(callArgs[1] as string);
      expect(writtenState.journey.observations).toHaveLength(100);
      expect(writtenState.journey.observations[99].observation).toBe("new");
    });
  });

  describe("addMilestone", () => {
    it("adds milestone and saves", async () => {
      const mockData = createDefaultState("test");
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockData));

      await manager.addMilestone("v1.0");

      expect(writeFile).toHaveBeenCalled();
      const callArgs = vi.mocked(writeFile).mock.calls[0];
      const writtenState = JSON.parse(callArgs[1] as string);
      expect(writtenState.journey.milestones).toHaveLength(1);
      expect(writtenState.journey.milestones[0].milestone).toBe("v1.0");
    });
  });

  describe("saveSession", () => {
    it("saves session data", async () => {
      await manager.saveSession("session-1", { foo: "bar" });
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining("session-1.json"),
        expect.stringContaining('"foo": "bar"'),
      );
    });
  });

  describe("getters", () => {
    it("returns paths and names", () => {
      expect(manager.getProjectName()).toBe("test-project");
      expect(manager.getSessionsDir()).toContain("/tmp/test-project/.opencode/mimic/sessions");
      expect(manager.getStatePath()).toContain("/tmp/test-project/.opencode/mimic/state.json");
    });
  });
});
