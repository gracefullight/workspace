import { tool } from "@opencode-ai/plugin";
import { SessionMemoryManager } from "@/modules/knowledge/memory";
import { SkillGenerator } from "@/modules/knowledge/skills";
import { ObservationLog, type ObservationType } from "@/modules/observation/log";
import type { ToolFactory } from "@/tools/registry";

/**
 * Automation tools: observations, session-context, generate-skills
 */
export const createAutomationTools: ToolFactory = (ctx) => {
  const { stateManager, directory, i18n, i18nPromise } = ctx;

  const mimicDir = stateManager.getInstinctsDir().replace("/instincts", "");
  const observationLog = new ObservationLog(mimicDir);
  const sessionMemory = new SessionMemoryManager(mimicDir, stateManager.getSessionsDir());
  const skillGenerator = new SkillGenerator(directory);

  return {
    "mimic:observations": tool({
      description: i18n.t("tool.observations.description"),
      args: {
        limit: tool.schema.number().optional().describe(i18n.t("tool.observations.args.limit")),
        types: tool.schema.string().optional().describe(i18n.t("tool.observations.args.types")),
      },
      async execute(args) {
        const i18n = await i18nPromise;

        const types = args.types
          ? (args.types.split(",").map((t) => t.trim()) as ObservationType[])
          : undefined;

        const observations = await observationLog.query({
          types,
          limit: args.limit ?? 20,
        });

        if (observations.length === 0) {
          return i18n.t("observations.empty");
        }

        const logSize = await observationLog.getLogSize();
        const sizeStr =
          logSize < 1024
            ? `${logSize}B`
            : logSize < 1024 * 1024
              ? `${(logSize / 1024).toFixed(1)}KB`
              : `${(logSize / (1024 * 1024)).toFixed(1)}MB`;

        let output = `${i18n.t("observations.title")}\n\n`;
        output += `${i18n.t("observations.stats", { count: observations.length, size: sizeStr })}\n\n`;

        for (const obs of observations.slice(0, 20)) {
          const time = new Date(obs.timestamp).toLocaleTimeString();
          const data = JSON.stringify(obs.data).slice(0, 60);
          output += `- \`${time}\` **${obs.type}**: ${data}...\n`;
        }

        return output;
      },
    }),

    "mimic:session-context": tool({
      description: i18n.t("tool.session_context.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;

        const memories = await sessionMemory.getRecentMemories(5);
        if (memories.length === 0) {
          return i18n.t("session_context.empty");
        }

        let output = `${i18n.t("session_context.title")}\n\n`;

        // Context summary
        const summary = await sessionMemory.getContextSummary();
        output += `${summary}\n\n`;

        // Cross-session patterns
        const patterns = await sessionMemory.analyzeCrossSessionPatterns();
        if (patterns.length > 0) {
          output += `${i18n.t("session_context.patterns_title")}\n`;
          for (const pattern of patterns.slice(0, 5)) {
            const confidence =
              "●".repeat(Math.round(pattern.confidence * 5)) +
              "○".repeat(5 - Math.round(pattern.confidence * 5));
            output += `- [${confidence}] ${pattern.description} (${pattern.frequency}x)\n`;
          }
          output += "\n";
        }

        // Continuity hints
        const hints = await sessionMemory.getContinuityHints();
        if (hints.length > 0) {
          output += "**Hints for this session:**\n";
          for (const hint of hints) {
            output += `- ${hint}\n`;
          }
        }

        return output;
      },
    }),

    "mimic:generate-skills": tool({
      description: i18n.t("tool.generate_skills.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const innerCtx = { stateManager, directory, i18n };

        await skillGenerator.initialize();
        const skills = await skillGenerator.generateAllEligibleSkills(innerCtx);

        if (skills.length === 0) {
          return i18n.t("generate_skills.empty");
        }

        let output = `${i18n.t("generate_skills.title")}\n\n`;
        output += `${i18n.t("generate_skills.success", { count: skills.length })}\n\n`;

        for (const skill of skills) {
          output += `### 📚 ${skill.name}\n`;
          output += `- **Domain**: ${skill.metadata.domain}\n`;
          output += `- **Path**: \`${skill.path}\`\n\n`;
        }

        return output;
      },
    }),
  };
};
