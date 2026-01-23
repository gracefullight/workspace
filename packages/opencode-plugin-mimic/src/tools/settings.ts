import { readdir, writeFile } from "node:fs/promises";
import { tool } from "@opencode-ai/plugin";
import { format } from "date-fns";
import { createDefaultState } from "@/core/state";
import { formatDetailLevel, formatGreetingStyle, formatLevelLabel } from "@/lib/i18n";
import { getLevelConfig } from "@/modules/evolution/system";
import type { ToolFactory } from "@/tools/registry";
import type { CreatorLevel } from "@/types";

/**
 * Settings tools: configure, reset, level, focus
 */
export const createSettingsTools: ToolFactory = (ctx) => {
  const { stateManager, i18n, i18nPromise } = ctx;

  return {
    "mimic:stats": tool({
      description: i18n.t("tool.stats.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        const sessionFiles = await readdir(stateManager.getSessionsDir()).catch(() => []);

        return `## ${i18n.t("stats.title")}

- **${i18n.t("stats.version")}**: ${state.version}
- **${i18n.t("stats.total_sessions")}**: ${state.statistics.totalSessions}
- **${i18n.t("stats.total_tool_calls")}**: ${state.statistics.totalToolCalls}
- **${i18n.t("stats.patterns_detected")}**: ${state.patterns.length}
- **${i18n.t("stats.milestones")}**: ${state.journey.milestones.length}
- **${i18n.t("stats.observations")}**: ${state.journey.observations.length}
- **${i18n.t("stats.session_records")}**: ${sessionFiles.length}
- **${i18n.t("stats.first_session")}**: ${format(state.project.firstSession, "yyyy-MM-dd HH:mm:ss")}
- **${i18n.t("stats.learning_enabled")}**: ${state.preferences.learningEnabled}
- **${i18n.t("stats.suggestions_enabled")}**: ${state.preferences.suggestionEnabled}`;
      },
    }),

    "mimic:configure": tool({
      description: i18n.t("tool.configure.description"),
      args: {
        learningEnabled: tool.schema
          .boolean()
          .optional()
          .describe(i18n.t("tool.configure.args.learningEnabled")),
        suggestionEnabled: tool.schema
          .boolean()
          .optional()
          .describe(i18n.t("tool.configure.args.suggestionEnabled")),
        minPatternCount: tool.schema
          .number()
          .optional()
          .describe(i18n.t("tool.configure.args.minPatternCount")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const state = await stateManager.read();

        if (args.learningEnabled !== undefined) {
          state.preferences.learningEnabled = args.learningEnabled;
        }
        if (args.suggestionEnabled !== undefined) {
          state.preferences.suggestionEnabled = args.suggestionEnabled;
        }
        if (args.minPatternCount !== undefined) {
          state.preferences.minPatternCount = args.minPatternCount;
        }

        await stateManager.save(state);
        return `${i18n.t("configure.updated")}\n${JSON.stringify(state.preferences, null, 2)}`;
      },
    }),

    "mimic:reset": tool({
      description: i18n.t("tool.reset.description"),
      args: {
        confirm: tool.schema.boolean().describe(i18n.t("tool.reset.args.confirm")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        if (!args.confirm) {
          return i18n.t("reset.cancelled");
        }

        await writeFile(
          stateManager.getStatePath(),
          JSON.stringify(createDefaultState(stateManager.getProjectName()), null, 2),
        );
        return i18n.t("reset.done");
      },
    }),

    "mimic:level": tool({
      description: i18n.t("tool.level.description"),
      args: {
        level: tool.schema
          .enum(["technical", "semi-technical", "non-technical", "chaotic"])
          .describe(i18n.t("tool.level.args.level")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        state.project.creatorLevel = args.level as CreatorLevel;
        await stateManager.save(state);

        const config = getLevelConfig(args.level as CreatorLevel);
        return i18n.t("level.set", {
          level: formatLevelLabel(i18n, args.level),
          style: formatGreetingStyle(i18n, config.greetingStyle),
          detail: formatDetailLevel(i18n, config.detailLevel),
        });
      },
    }),

    "mimic:focus": tool({
      description: i18n.t("tool.focus.description"),
      args: {
        focus: tool.schema.string().optional().describe(i18n.t("tool.focus.args.focus")),
        stack: tool.schema.string().optional().describe(i18n.t("tool.focus.args.stack")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const state = await stateManager.read();

        if (args.focus) {
          state.project.focus = args.focus;
          await stateManager.addObservation(i18n.t("obs.focus_changed", { focus: args.focus }));
        }
        if (args.stack) {
          state.project.stack = args.stack.split(",").map((s) => s.trim());
        }

        await stateManager.save(state);

        let output = `${i18n.t("focus.updated")}\n`;
        if (state.project.focus)
          output += `- **${i18n.t("focus.focus_label")}**: ${state.project.focus}\n`;
        if (state.project.stack?.length)
          output += `- **${i18n.t("focus.stack_label")}**: ${state.project.stack.join(", ")}\n`;
        return output;
      },
    }),
  };
};
