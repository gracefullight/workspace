import { execSync } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import {
  detectCommitPatterns,
  getCommitMessages,
  getGitHistory,
  getRecentlyModifiedFiles,
} from "@/lib/git";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

describe("git", () => {
  describe("detectCommitPatterns", () => {
    it("counts repeated messages", () => {
      const messages = ["Fix bug", "fix bug", "Feature A", "fix bug "];
      const patterns = detectCommitPatterns(messages);

      expect(patterns.get("fix bug")).toBe(3);
      expect(patterns.get("feature a")).toBe(1);
    });
  });

  describe("commands", () => {
    it("getGitHistory calls git log", () => {
      vi.mocked(execSync).mockReturnValue("commit1\ncommit2");
      const history = getGitHistory("/tmp");
      expect(execSync).toHaveBeenCalledWith(expect.stringContaining("git log"), expect.any(Object));
      expect(history).toEqual(["commit1", "commit2"]);
    });

    it("getGitHistory handles errors", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("git error");
      });
      const history = getGitHistory("/tmp");
      expect(history).toEqual([]);
    });

    it("getRecentlyModifiedFiles calls git diff", () => {
      vi.mocked(execSync).mockReturnValue("file1.ts\nfile2.ts");
      const files = getRecentlyModifiedFiles("/tmp");
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining("git diff"),
        expect.any(Object),
      );
      expect(files).toEqual(["file1.ts", "file2.ts"]);
    });

    it("getRecentlyModifiedFiles handles errors", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("git error");
      });
      const files = getRecentlyModifiedFiles("/tmp");
      expect(files).toEqual([]);
    });

    it("getCommitMessages calls git log with format", () => {
      vi.mocked(execSync).mockReturnValue("msg1\nmsg2");
      const msgs = getCommitMessages("/tmp");
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining("git log --format=%s"),
        expect.any(Object),
      );
      expect(msgs).toEqual(["msg1", "msg2"]);
    });

    it("getCommitMessages handles errors", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("git error");
      });
      const msgs = getCommitMessages("/tmp");
      expect(msgs).toEqual([]);
    });
  });
});
