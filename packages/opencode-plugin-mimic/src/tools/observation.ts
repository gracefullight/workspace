import { tool } from "@opencode-ai/plugin";
import type { ToolFactory } from "@/tools/registry";

/**
 * Observation tools: observe, milestone, surface
 */
export const createObservationTools: ToolFactory = (ctx) => {
  const { stateManager, i18n, i18nPromise } = ctx;

  return {
    "mimic:observe": tool({
      description: i18n.t("tool.observe.description"),
      args: {
        observation: tool.schema.string().describe(i18n.t("tool.observe.args.observation")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        await stateManager.addObservation(args.observation);
        return i18n.t("observe.recorded", { observation: args.observation });
      },
    }),

    "mimic:milestone": tool({
      description: i18n.t("tool.milestone.description"),
      args: {
        milestone: tool.schema.string().describe(i18n.t("tool.milestone.args.milestone")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        await stateManager.addMilestone(args.milestone);
        return i18n.t("milestone.recorded", { milestone: args.milestone });
      },
    }),

    "mimic:surface": tool({
      description: i18n.t("tool.surface.description"),
      args: {
        patternId: tool.schema.string().describe(i18n.t("tool.surface.args.patternId")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        const pattern = state.patterns.find((p) => p.id === args.patternId);
        if (!pattern) {
          return i18n.t("surface.not_found", { id: args.patternId });
        }
        pattern.surfaced = true;
        await stateManager.save(state);
        return i18n.t("surface.marked", { description: pattern.description });
      },
    }),
  };
};
