import { tool } from "@opencode-ai/plugin";
import { createMacroFromSteps, formatMacroForDisplay } from "@/modules/automation/macros";
import { SessionMemoryManager } from "@/modules/knowledge/memory";
import { SkillGenerator } from "@/modules/knowledge/skills";
import { ObservationLog, type ObservationType } from "@/modules/observation/log";
import type { ToolFactory } from "@/tools/registry";
import type { MacroRecording, MacroStep } from "@/types";

let macroRecording: MacroRecording | null = null;

export function getMacroRecording(): MacroRecording | null {
  return macroRecording;
}

export function recordMacroStep(tool: string, args?: Record<string, unknown>): void {
  if (macroRecording?.isRecording) {
    macroRecording.steps.push({ tool, args });
  }
}

/**
 * Automation tools: observations, session-context, generate-skills, macros
 */
export const createAutomationTools: ToolFactory = (ctx) => {
  const { stateManager, directory, i18n, i18nPromise } = ctx;

  const mimicDir = stateManager.getInstinctsDir().replace("/instincts", "");
  const observationLog = new ObservationLog(mimicDir);
  const sessionMemory = new SessionMemoryManager(mimicDir, stateManager.getSessionsDir());
  const skillGenerator = new SkillGenerator(directory);

  return {
    "mimic-observations": tool({
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

    "mimic-session-context": tool({
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

    "mimic-generate-skills": tool({
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

    "mimic-macro-record": tool({
      description: i18n.t("tool.macro_record.description"),
      args: {
        action: tool.schema
          .enum(["start", "stop"])
          .describe(i18n.t("tool.macro_record.args.action")),
        name: tool.schema.string().optional().describe(i18n.t("tool.macro_record.args.name")),
        description: tool.schema
          .string()
          .optional()
          .describe(i18n.t("tool.macro_record.args.description")),
      },
      async execute(args) {
        const i18n = await i18nPromise;

        if (args.action === "start") {
          macroRecording = {
            isRecording: true,
            startedAt: new Date().toISOString(),
            steps: [],
          };
          return i18n.t("macro.recording_started");
        }

        if (!macroRecording || macroRecording.steps.length === 0) {
          return i18n.t("macro.recording_empty");
        }

        const steps = [...macroRecording.steps];
        macroRecording = null;

        const name = args.name || `macro-${Date.now()}`;
        const description = args.description || `${steps.length} steps recorded`;

        const macro = createMacroFromSteps(name, description, steps);
        await stateManager.writeMacro(macro);

        return i18n.t("macro.saved", { name, steps: steps.length });
      },
    }),

    "mimic-macro-list": tool({
      description: i18n.t("tool.macro_list.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const macros = await stateManager.listMacros();

        if (macros.length === 0) {
          return i18n.t("macro.list_empty");
        }

        let output = `${i18n.t("macro.list_title")}\n\n`;
        for (const macro of macros) {
          output += formatMacroForDisplay(macro, i18n);
          output += "\n---\n\n";
        }

        return output;
      },
    }),

    "mimic-macro-run": tool({
      description: i18n.t("tool.macro_run.description"),
      args: {
        id: tool.schema.string().describe(i18n.t("tool.macro_run.args.id")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const macro = await stateManager.getMacro(args.id);

        if (!macro) {
          return i18n.t("macro.not_found", { id: args.id });
        }

        macro.useCount++;
        macro.lastUsed = new Date().toISOString();
        await stateManager.writeMacro(macro);

        let output = `${i18n.t("macro.run_title", { name: macro.name })}\n\n`;
        output += `${i18n.t("macro.run_instructions")}\n\n`;

        for (let i = 0; i < macro.toolSequence.length; i++) {
          const step = macro.toolSequence[i];
          const argsStr = step.args ? ` with args: \`${JSON.stringify(step.args)}\`` : "";
          output += `${i + 1}. \`${step.tool}\`${argsStr}\n`;
        }

        output += `\n*${i18n.t("macro.run_hint")}*`;
        return output;
      },
    }),

    "mimic-macro-save": tool({
      description: i18n.t("tool.macro_save.description"),
      args: {
        name: tool.schema.string().describe(i18n.t("tool.macro_save.args.name")),
        description: tool.schema
          .string()
          .optional()
          .describe(i18n.t("tool.macro_save.args.description")),
        lastN: tool.schema.number().optional().describe(i18n.t("tool.macro_save.args.lastN")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const state = await stateManager.read();
        const sequences = state.statistics.toolSequences || [];

        if (sequences.length === 0) {
          return i18n.t("macro.no_sequences");
        }

        const lastN = args.lastN || 1;
        const topSequences = sequences.slice(0, lastN);

        const steps: MacroStep[] = [];
        for (const seq of topSequences) {
          for (const tool of seq.tools) {
            steps.push({ tool });
          }
        }

        const macro = createMacroFromSteps(
          args.name,
          args.description || `Created from top ${lastN} sequences`,
          steps,
        );
        await stateManager.writeMacro(macro);

        return i18n.t("macro.saved", { name: args.name, steps: steps.length });
      },
    }),

    "mimic-macro-delete": tool({
      description: i18n.t("tool.macro_delete.description"),
      args: {
        id: tool.schema.string().describe(i18n.t("tool.macro_delete.args.id")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const deleted = await stateManager.deleteMacro(args.id);

        if (!deleted) {
          return i18n.t("macro.not_found", { id: args.id });
        }

        return i18n.t("macro.deleted", { id: args.id });
      },
    }),
  };
};
