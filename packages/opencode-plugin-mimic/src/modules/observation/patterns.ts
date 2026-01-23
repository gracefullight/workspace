import type { MimicContext } from "@/core/context";
import { detectCommitPatterns, getCommitMessages } from "@/lib/git";
import type { Pattern } from "@/types";
import { generateId } from "@/utils/id";

export async function detectPatterns(ctx: MimicContext): Promise<Pattern[]> {
  const state = await ctx.stateManager.read();
  const newPatterns: Pattern[] = [];

  const commitMessages = getCommitMessages(ctx.directory);
  const commitPatterns = detectCommitPatterns(commitMessages);
  for (const [msg, count] of commitPatterns) {
    if (count >= 3) {
      const existing = state.patterns.find((p) => p.type === "commit" && p.description === msg);
      if (!existing) {
        newPatterns.push({
          id: generateId(),
          type: "commit",
          description: msg,
          count,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          surfaced: false,
          examples: [],
        });
      }
    }
  }

  const fileStats = state.statistics.filesModified;
  for (const [file, count] of Object.entries(fileStats)) {
    if (count >= 5) {
      const existing = state.patterns.find((p) => p.type === "file" && p.description === file);
      if (!existing) {
        newPatterns.push({
          id: generateId(),
          type: "file",
          description: file,
          count,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          surfaced: false,
          examples: [],
        });
      }
    }
  }

  return newPatterns;
}

export async function surfacePatterns(ctx: MimicContext): Promise<string[]> {
  const state = await ctx.stateManager.read();
  const suggestions: string[] = [];

  for (const pattern of state.patterns) {
    if (pattern.surfaced) continue;
    if (pattern.count < state.preferences.minPatternCount) continue;

    let suggestion = "";
    switch (pattern.type) {
      case "commit":
        suggestion = ctx.i18n.t("suggest.commit", {
          pattern: pattern.description,
          count: pattern.count,
        });
        break;
      case "file":
        suggestion = ctx.i18n.t("suggest.file", {
          pattern: pattern.description,
          count: pattern.count,
        });
        break;
      case "tool":
        suggestion = ctx.i18n.t("suggest.tool", {
          pattern: pattern.description,
          count: pattern.count,
        });
        break;
      case "sequence":
        suggestion = ctx.i18n.t("suggest.sequence", {
          pattern: pattern.description,
          count: pattern.count,
        });
        break;
    }
    suggestions.push(suggestion);
  }

  return suggestions;
}
