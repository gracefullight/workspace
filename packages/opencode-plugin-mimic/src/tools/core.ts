import { tool } from "@opencode-ai/plugin";
import { getGitHistory, getRecentlyModifiedFiles } from "@/lib/git";
import { formatPatternType } from "@/lib/i18n";
import { surfacePatterns } from "@/modules/observation/patterns";
import type { ToolFactory } from "@/tools/registry";
import type { Pattern } from "@/types";
import { analyzeTimeSinceLastSession, formatGrowAnalysis, formatJourney } from "@/utils/format";

/**
 * Core tools: init, status, journey, patterns, grow
 */
export const createCoreTools: ToolFactory = (ctx) => {
  const { stateManager, directory, toolCalls, i18n, i18nPromise } = ctx;

  return {
    "mimic:init": tool({
      description: i18n.t("tool.init.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        const isFirstTime = state.journey.sessionCount <= 1;

        if (isFirstTime) {
          return i18n.t("init.first_time", { project: state.project.name });
        }

        const timeSince = analyzeTimeSinceLastSession(state.journey.lastSession);
        const recentObs = state.journey.observations.slice(-3);

        let greeting = `${i18n.t("init.returning.header")}\n\n`;
        greeting += `${i18n.t("init.returning.welcome", { project: state.project.name })}\n\n`;
        greeting += `${i18n.t("init.returning.stats", {
          sessions: state.journey.sessionCount,
          patterns: state.patterns.length,
        })}\n\n`;

        if (timeSince === "long-break") {
          greeting += `${i18n.t("init.returning.long_break")}\n\n`;
        }

        if (recentObs.length > 0) {
          greeting += `${i18n.t("init.returning.recent_obs_title")}\n`;
          for (const o of recentObs) {
            greeting += `- ${o.observation}\n`;
          }
        }

        return greeting;
      },
    }),

    "mimic:status": tool({
      description: i18n.t("tool.status.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };
        const state = await stateManager.read();
        const recentFiles = getRecentlyModifiedFiles(directory);
        const gitHistory = getGitHistory(directory, 5);

        let output = `${i18n.t("status.title", { project: state.project.name })}\n\n`;
        output += `${i18n.t("status.session", { count: state.journey.sessionCount })}\n`;
        output += `${i18n.t("status.patterns", {
          total: state.patterns.length,
          surfaced: state.patterns.filter((p) => p.surfaced).length,
        })}\n`;
        output += `${i18n.t("status.tool_calls", { count: toolCalls.length })}\n\n`;

        if (recentFiles.length > 0) {
          output += `${i18n.t("status.recent_files")}\n`;
          for (const f of recentFiles.slice(0, 5)) {
            output += `- ${f}\n`;
          }
          output += "\n";
        }

        if (gitHistory.length > 0) {
          output += `${i18n.t("status.recent_commits")}\n`;
          for (const c of gitHistory) {
            output += `- ${c}\n`;
          }
        }

        const suggestions = await surfacePatterns(innerCtx);
        if (suggestions.length > 0) {
          output += `\n${i18n.t("status.suggestions")}\n`;
          for (const s of suggestions) {
            output += `- ${s}\n`;
          }
        }

        return output;
      },
    }),

    "mimic:journey": tool({
      description: i18n.t("tool.journey.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };
        const state = await stateManager.read();
        const gitHistory = getGitHistory(directory, 10);
        return formatJourney(innerCtx, state, gitHistory);
      },
    }),

    "mimic:patterns": tool({
      description: i18n.t("tool.patterns.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();

        if (state.patterns.length === 0) {
          return i18n.t("patterns.none");
        }

        let output = `${i18n.t("patterns.title")}\n\n`;
        output += `${i18n.t("patterns.total", { count: state.patterns.length })}\n\n`;

        const byType = new Map<string, Pattern[]>();
        for (const p of state.patterns) {
          const list = byType.get(p.type) || [];
          list.push(p);
          byType.set(p.type, list);
        }

        for (const [type, patterns] of byType) {
          output += `${i18n.t("patterns.section", {
            type: formatPatternType(i18n, type),
          })}\n`;
          for (const p of patterns.slice(0, 10)) {
            const status = p.surfaced ? "✓" : "○";
            output += `${status} **${p.description}** (${p.count}x)\n`;
          }
          output += "\n";
        }

        return output;
      },
    }),

    "mimic:grow": tool({
      description: i18n.t("tool.grow.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };
        const state = await stateManager.read();
        const gitHistory = getGitHistory(directory, 20);
        const recentFiles = getRecentlyModifiedFiles(directory);
        return formatGrowAnalysis(innerCtx, state, gitHistory, recentFiles);
      },
    }),
  };
};
