import { execSync } from "node:child_process";

export type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "test" | "chore";

export interface CommitSuggestion {
  message: string;
  type: CommitType;
  scope?: string;
  description: string;
  confidence: number;
}

export interface DiffSummary {
  filesChanged: string[];
  additions: number;
  deletions: number;
  diffContent: string;
}

export function getGitDiffSummary(directory: string): DiffSummary | null {
  try {
    const stagedDiff = execSync("git diff --cached --stat", {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const unstagedDiff = execSync("git diff --stat", {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const diff = stagedDiff || unstagedDiff;
    if (!diff) return null;

    const filesChanged = execSync(
      stagedDiff ? "git diff --cached --name-only" : "git diff --name-only",
      { cwd: directory, encoding: "utf-8", timeout: 5000 },
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    const diffContent = execSync(stagedDiff ? "git diff --cached" : "git diff", {
      cwd: directory,
      encoding: "utf-8",
      timeout: 10000,
    }).slice(0, 5000);

    const stats = diff.split("\n").pop() || "";
    const addMatch = stats.match(/(\d+) insertion/);
    const delMatch = stats.match(/(\d+) deletion/);

    return {
      filesChanged,
      additions: addMatch ? Number.parseInt(addMatch[1], 10) : 0,
      deletions: delMatch ? Number.parseInt(delMatch[1], 10) : 0,
      diffContent,
    };
  } catch {
    return null;
  }
}

export function getStagedFiles(directory: string): string[] {
  try {
    return execSync("git diff --cached --name-only", {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function inferCommitType(filesChanged: string[]): CommitType {
  const patterns: { pattern: RegExp; type: CommitType }[] = [
    { pattern: /\.(test|spec)\.(ts|js|tsx|jsx)$/, type: "test" },
    { pattern: /__(tests|mocks)__/, type: "test" },
    { pattern: /\.(md|mdx|txt|rst)$/, type: "docs" },
    { pattern: /README/, type: "docs" },
    { pattern: /CHANGELOG/, type: "docs" },
    { pattern: /\.(css|scss|less|styled)/, type: "style" },
    { pattern: /\.config\.(ts|js|json)$/, type: "chore" },
    { pattern: /package\.json$/, type: "chore" },
    { pattern: /tsconfig/, type: "chore" },
    { pattern: /\.eslint|\.prettier|biome/, type: "chore" },
  ];

  const typeCounts: Record<CommitType, number> = {
    feat: 0,
    fix: 0,
    docs: 0,
    style: 0,
    refactor: 0,
    test: 0,
    chore: 0,
  };

  for (const file of filesChanged) {
    let matched = false;
    for (const { pattern, type } of patterns) {
      if (pattern.test(file)) {
        typeCounts[type]++;
        matched = true;
        break;
      }
    }
    if (!matched) {
      typeCounts.feat++;
    }
  }

  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as CommitType) || "feat";
}

export function inferScope(filesChanged: string[]): string | null {
  if (filesChanged.length === 0) return null;

  if (filesChanged.length === 1) {
    return inferScopeFromPath(filesChanged[0]);
  }

  return inferScopeFromStats(filesChanged);
}

function inferScopeFromPath(filePath: string): string | null {
  const parts = filePath.split("/");
  if (parts.length > 1) {
    return parts[parts.length > 2 ? 1 : 0];
  }
  return null;
}

function inferScopeFromStats(filesChanged: string[]): string | null {
  const dirs = new Map<string, number>();

  for (const file of filesChanged) {
    const dir = inferScopeFromPath(file);
    if (dir) {
      dirs.set(dir, (dirs.get(dir) || 0) + 1);
    }
  }

  if (dirs.size === 0) return null;

  const sorted = Array.from(dirs.entries()).sort((a, b) => b[1] - a[1]);
  const topDir = sorted[0];

  if (topDir && topDir[1] >= filesChanged.length * 0.5) {
    return topDir[0];
  }

  return null;
}

export function generateDescription(
  filesChanged: string[],
  _diffSummary: DiffSummary,
  type: CommitType,
): string {
  const fileCount = filesChanged.length;

  if (fileCount === 1) {
    const fileName = filesChanged[0].split("/").pop() || filesChanged[0];
    const action = type === "fix" ? "fix" : type === "docs" ? "update" : "add";
    return `${action} ${fileName}`;
  }

  const scope = inferScope(filesChanged);
  const scopeStr = scope ? `in ${scope}` : "";

  switch (type) {
    case "test":
      return `add/update tests ${scopeStr}`.trim();
    case "docs":
      return `update documentation ${scopeStr}`.trim();
    case "style":
      return `update styles ${scopeStr}`.trim();
    case "chore":
      return `update configuration ${scopeStr}`.trim();
    case "fix":
      return `fix issues ${scopeStr}`.trim();
    case "refactor":
      return `refactor code ${scopeStr}`.trim();
    default:
      return `implement changes ${scopeStr}`.trim();
  }
}

export function generateCommitSuggestions(
  directory: string,
  _sessionTools: string[],
  _sessionFiles: string[],
): CommitSuggestion[] {
  const diff = getGitDiffSummary(directory);
  if (!diff || diff.filesChanged.length === 0) {
    return [];
  }

  const suggestions: CommitSuggestion[] = [];
  const primaryType = inferCommitType(diff.filesChanged);
  const scope = inferScope(diff.filesChanged);
  const description = generateDescription(diff.filesChanged, diff, primaryType);

  suggestions.push({
    type: primaryType,
    scope: scope || undefined,
    description,
    message: formatConventionalCommit({
      type: primaryType,
      scope: scope || undefined,
      description,
      confidence: 0.8,
    }),
    confidence: 0.8,
  });

  const alternativeTypes: CommitType[] = ["refactor", "fix", "chore"];
  for (const altType of alternativeTypes) {
    if (altType === primaryType) continue;

    const altDescription = generateDescription(diff.filesChanged, diff, altType);
    suggestions.push({
      type: altType,
      scope: scope || undefined,
      description: altDescription,
      message: formatConventionalCommit({
        type: altType,
        scope: scope || undefined,
        description: altDescription,
        confidence: 0.5,
      }),
      confidence: 0.5,
    });

    if (suggestions.length >= 3) break;
  }

  return suggestions;
}

export function formatConventionalCommit(suggestion: Omit<CommitSuggestion, "message">): string {
  const scopePart = suggestion.scope ? `(${suggestion.scope})` : "";
  return `${suggestion.type}${scopePart}: ${suggestion.description}`;
}

export function executeCommit(directory: string, message: string): boolean {
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: directory,
      encoding: "utf-8",
      timeout: 30000,
    });
    return true;
  } catch {
    return false;
  }
}
