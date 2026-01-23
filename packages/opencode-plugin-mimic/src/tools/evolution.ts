import { tool } from "@opencode-ai/plugin";
import { format } from "date-fns";
import { formatCapabilityType } from "@/lib/i18n";
import {
  evolveCapability,
  formatEvolutionResult,
  getEvolutionSuggestions,
} from "@/modules/evolution/engine";
import type { ToolFactory } from "@/tools/registry";

/**
 * Evolution tools: evolve, capabilities
 */
export const createEvolutionTools: ToolFactory = (ctx) => {
  const { stateManager, directory, i18n, i18nPromise } = ctx;

  return {
    "mimic:evolve": tool({
      description: i18n.t("tool.evolve.description"),
      args: {
        accept: tool.schema.string().optional().describe(i18n.t("tool.evolve.args.accept")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };

        if (args.accept) {
          const suggestions = await getEvolutionSuggestions(innerCtx);
          const suggestion = suggestions.find((s) => s.pattern.id === args.accept);
          if (!suggestion) {
            return i18n.t("evolve.no_pattern", { id: args.accept });
          }
          const { capability, filePath } = await evolveCapability(innerCtx, suggestion);
          return `${i18n.t("evolve.absorbed_header")}\n\n${formatEvolutionResult(
            innerCtx,
            capability,
            filePath,
          )}`;
        }

        const suggestions = await getEvolutionSuggestions(innerCtx);
        if (suggestions.length === 0) {
          return i18n.t("evolve.empty");
        }

        let output = `${i18n.t("evolve.menu_title")}\n\n`;
        output += `${i18n.t("evolve.menu_intro")}\n\n`;

        for (const s of suggestions) {
          output += `### ✨ ${s.name}\n`;
          output += `- **${i18n.t("evolve.menu_type")}**: ${formatCapabilityType(i18n, s.type)}\n`;
          output += `- **${i18n.t("evolve.menu_reason")}**: ${s.reason}\n`;
          output += `- **${i18n.t("evolve.menu_pattern_id")}**: \`${s.pattern.id}\`\n\n`;
        }

        output += `\n${i18n.t("evolve.menu_footer")}`;
        return output;
      },
    }),

    "mimic:capabilities": tool({
      description: i18n.t("tool.capabilities.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();

        if (state.evolution.capabilities.length === 0) {
          return i18n.t("capabilities.empty");
        }

        let output = `${i18n.t("capabilities.title")}\n\n`;
        output += `${i18n.t("capabilities.intro")}\n\n`;
        for (const cap of state.evolution.capabilities) {
          output += `### ✨ ${cap.name}\n`;
          output += `- **${i18n.t("capabilities.type")}**: ${formatCapabilityType(
            i18n,
            cap.type,
          )}\n`;
          output += `- **${i18n.t("capabilities.description")}**: ${cap.description}\n`;
          output += `- **${i18n.t("capabilities.consumed")}**: ${format(
            new Date(cap.createdAt),
            "yyyy-MM-dd",
          )}\n\n`;
        }
        return output;
      },
    }),
  };
};
