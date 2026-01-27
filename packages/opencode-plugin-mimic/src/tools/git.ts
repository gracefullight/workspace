import { tool } from "@opencode-ai/plugin";
import {
  executeCommit,
  generateCommitSuggestions,
  getGitDiffSummary,
} from "@/modules/git/commit-suggest";
import type { ToolFactory } from "@/tools/registry";

/**
 * Git tools: commit-suggest, commit
 */
export const createGitTools: ToolFactory = (ctx) => {
  const { stateManager, directory, toolCalls, i18n, i18nPromise } = ctx;

  return {
    "mimic-commit-suggest": tool({
      description: i18n.t("tool.commit_suggest.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;

        const recentTools = toolCalls.slice(-20).map((t) => t.tool);
        const state = await stateManager.read();
        const recentFiles = Object.keys(state.statistics.filesModified).slice(-10);

        const suggestions = generateCommitSuggestions(directory, recentTools, recentFiles);

        if (suggestions.length === 0) {
          return i18n.t("commit.no_changes");
        }

        const diff = getGitDiffSummary(directory);

        let output = `${i18n.t("commit.suggestions_title")}\n\n`;

        if (diff) {
          output += `**${i18n.t("commit.files_changed")}**: ${diff.filesChanged.length}\n`;
          output += `**${i18n.t("commit.additions")}**: +${diff.additions} / **${i18n.t("commit.deletions")}**: -${diff.deletions}\n\n`;
        }

        for (let i = 0; i < suggestions.length; i++) {
          const s = suggestions[i];
          const confidence =
            "●".repeat(Math.round(s.confidence * 5)) + "○".repeat(5 - Math.round(s.confidence * 5));
          output += `### ${i + 1}. \`${s.message}\`\n`;
          output += `- **${i18n.t("commit.type")}**: ${s.type}\n`;
          if (s.scope) {
            output += `- **${i18n.t("commit.scope")}**: ${s.scope}\n`;
          }
          output += `- **${i18n.t("commit.confidence")}**: [${confidence}]\n\n`;
        }

        output += `*${i18n.t("commit.usage_hint")}*`;
        return output;
      },
    }),

    "mimic-commit": tool({
      description: i18n.t("tool.commit.description"),
      args: {
        message: tool.schema.string().optional().describe(i18n.t("tool.commit.args.message")),
        suggestion: tool.schema.number().optional().describe(i18n.t("tool.commit.args.suggestion")),
        dryRun: tool.schema.boolean().optional().describe(i18n.t("tool.commit.args.dry_run")),
      },
      async execute(args) {
        const i18n = await i18nPromise;

        let commitMessage = args.message;

        if (!commitMessage && args.suggestion !== undefined) {
          const recentTools = toolCalls.slice(-20).map((t) => t.tool);
          const state = await stateManager.read();
          const recentFiles = Object.keys(state.statistics.filesModified).slice(-10);

          const suggestions = generateCommitSuggestions(directory, recentTools, recentFiles);
          const idx = args.suggestion - 1;

          if (idx >= 0 && idx < suggestions.length) {
            commitMessage = suggestions[idx].message;
          }
        }

        if (!commitMessage) {
          return i18n.t("commit.no_message");
        }

        if (args.dryRun) {
          return i18n.t("commit.dry_run", { message: commitMessage });
        }

        const success = executeCommit(directory, commitMessage);

        if (success) {
          await stateManager.addMilestone(`Committed: ${commitMessage}`);
          return i18n.t("commit.executed", { message: commitMessage });
        }

        return i18n.t("commit.failed");
      },
    }),
  };
};
