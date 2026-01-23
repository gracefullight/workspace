import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";
import { format } from "date-fns";
import { getRecentlyModifiedFiles } from "@/lib/git";
import {
  formatInstinctSuggestion,
  getApplicableInstincts,
} from "@/modules/knowledge/instinct-apply";
import type { ToolFactory } from "@/tools/registry";
import type { Instinct } from "@/types";

/**
 * Instinct tools: instincts, export, import, apply, identity, sequences
 */
export const createInstinctTools: ToolFactory = (ctx) => {
  const { stateManager, directory, toolCalls, i18n, i18nPromise } = ctx;

  return {
    "mimic:instincts": tool({
      description: i18n.t("tool.instincts.description"),
      args: {
        domain: tool.schema.string().optional().describe(i18n.t("tool.instincts.args.domain")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const instincts = await stateManager.listInstincts();

        if (instincts.length === 0) {
          return i18n.t("instincts.empty");
        }

        let filtered = instincts;
        if (args.domain) {
          filtered = instincts.filter((inst) => inst.domain === args.domain);
        }

        const byDomain = groupInstinctsByDomain(filtered);

        let output = `${i18n.t("instincts.title")}\n\n`;
        output += `${i18n.t("instincts.total", { count: filtered.length })}\n\n`;

        for (const [domain, domainInstincts] of byDomain) {
          output += `### ${domain}\n`;
          for (const inst of domainInstincts.slice(0, 10)) {
            const bar =
              "●".repeat(Math.round(inst.confidence * 5)) +
              "○".repeat(5 - Math.round(inst.confidence * 5));
            const sourceTag = inst.source === "inherited" ? " 📥" : "";
            output += `- [${bar}] **${inst.title}**${sourceTag}\n`;
            output += `  ${inst.description}\n`;
          }
          output += "\n";
        }

        return output;
      },
    }),

    "mimic:export": tool({
      description: i18n.t("tool.export.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const exported = await stateManager.exportInstincts();

        if (exported.instincts.length === 0) {
          return i18n.t("export.empty");
        }

        const exportPath = join(directory, ".opencode", "mimic", "exports");
        if (!existsSync(exportPath)) {
          await mkdir(exportPath, { recursive: true });
        }

        const filename = `instincts-${format(new Date(), "yyyy-MM-dd-HHmmss")}.json`;
        const filePath = join(exportPath, filename);
        await writeFile(filePath, JSON.stringify(exported, null, 2));

        return i18n.t("export.success", {
          count: exported.instincts.length,
          path: filePath,
        });
      },
    }),

    "mimic:import": tool({
      description: i18n.t("tool.import.description"),
      args: {
        path: tool.schema.string().describe(i18n.t("tool.import.args.path")),
      },
      async execute(args) {
        const i18n = await i18nPromise;

        if (!existsSync(args.path)) {
          return i18n.t("import.not_found", { path: args.path });
        }

        try {
          const content = await readFile(args.path, "utf-8");
          const data = JSON.parse(content) as {
            instincts: Instinct[];
            metadata: { projectName: string };
          };

          const imported = await stateManager.importInstincts(
            data.instincts,
            data.metadata.projectName,
          );

          await stateManager.updateIdentityStats();

          return i18n.t("import.success", {
            count: imported,
            from: data.metadata.projectName,
          });
        } catch {
          return i18n.t("import.error");
        }
      },
    }),

    "mimic:apply": tool({
      description: i18n.t("tool.apply.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };
        const recentTools = toolCalls.slice(-10).map((t) => t.tool);
        const recentFiles = getRecentlyModifiedFiles(directory).slice(0, 5);

        const applicable = await getApplicableInstincts(innerCtx, recentTools, recentFiles);

        if (applicable.length === 0) {
          return i18n.t("apply.none");
        }

        let output = `${i18n.t("apply.title")}\n\n`;
        for (const applied of applicable) {
          output += `${formatInstinctSuggestion(applied, i18n)}\n`;
          output += `  → ${applied.instinct.description}\n\n`;
        }

        return output;
      },
    }),

    "mimic:identity": tool({
      description: i18n.t("tool.identity.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();

        if (!state.project.identity) {
          await stateManager.initializeIdentity();
          const updated = await stateManager.read();
          state.project.identity = updated.project.identity;
        }

        if (!state.project.identity) {
          return i18n.t("identity.error");
        }
        const identity = state.project.identity;
        const awakened = new Date(identity.awakened);
        const daysAlive = Math.floor((Date.now() - awakened.getTime()) / (1000 * 60 * 60 * 24));

        let output = `${i18n.t("identity.title")}\n\n`;
        output += `**${i18n.t("identity.personality")}**: ${identity.personality}\n`;
        output += `**${i18n.t("identity.awakened")}**: ${format(awakened, "yyyy-MM-dd")} (${daysAlive} ${i18n.t("identity.days")})\n`;
        output += `**${i18n.t("identity.instincts_learned")}**: ${identity.totalInstinctsLearned}\n`;
        output += `**${i18n.t("identity.evolutions")}**: ${identity.totalEvolutions}\n`;

        if (identity.favoriteDomainsRank.length > 0) {
          output += `**${i18n.t("identity.favorite_domains")}**: ${identity.favoriteDomainsRank.join(", ")}\n`;
        }

        return output;
      },
    }),

    "mimic:sequences": tool({
      description: i18n.t("tool.sequences.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        const sequences = state.statistics.toolSequences || [];

        if (sequences.length === 0) {
          return i18n.t("sequences.empty");
        }

        let output = `${i18n.t("sequences.title")}\n\n`;
        for (const seq of sequences.slice(0, 10)) {
          output += `- **${seq.tools.join(" → ")}** (${seq.count}x)\n`;
        }

        return output;
      },
    }),
  };
};

function groupInstinctsByDomain(instincts: Instinct[]): Map<string, Instinct[]> {
  const byDomain = new Map<string, Instinct[]>();
  for (const inst of instincts) {
    const list = byDomain.get(inst.domain) || [];
    list.push(inst);
    byDomain.set(inst.domain, list);
  }
  return byDomain;
}
