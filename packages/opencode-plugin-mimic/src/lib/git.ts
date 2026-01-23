import { execSync } from "node:child_process";

export function getGitHistory(directory: string, limit = 50): string[] {
  try {
    const result = execSync(`git log --oneline -n ${limit}`, {
      cwd: directory,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function getRecentlyModifiedFiles(directory: string): string[] {
  try {
    const result = execSync(
      "git diff --name-only HEAD~10 HEAD 2>/dev/null || git diff --name-only",
      {
        cwd: directory,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function getCommitMessages(directory: string, limit = 20): string[] {
  try {
    const result = execSync(`git log --format=%s -n ${limit}`, {
      cwd: directory,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function detectCommitPatterns(messages: string[]): Map<string, number> {
  const patterns = new Map<string, number>();
  for (const msg of messages) {
    const normalized = msg.toLowerCase().replace(/\s+/g, " ").trim();
    patterns.set(normalized, (patterns.get(normalized) || 0) + 1);
  }
  return patterns;
}
