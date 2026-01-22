import { readdir, writeFile } from "node:fs/promises";
import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { format } from "date-fns";
import { evolveCapability, formatEvolutionResult, getEvolutionSuggestions } from "@/evolution";
import { analyzeTimeSinceLastSession, formatGrowAnalysis, formatJourney } from "@/format";
import { getGitHistory, getRecentlyModifiedFiles } from "@/git";
import {
  createI18n,
  formatCapabilityType,
  formatDetailLevel,
  formatGreetingStyle,
  formatLevelLabel,
  formatPatternType,
  type I18n,
  loadMimicConfig,
  resolveLanguage,
} from "@/i18n";
import { getLevelConfig } from "@/level";
import { surfacePatterns } from "@/patterns";
import { createDefaultState, type StateManager } from "@/state";
import type { CreatorLevel, Pattern, ToolCall } from "@/types";

export function createTools(
  stateManager: StateManager,
  directory: string,
  toolCalls: ToolCall[],
  i18n?: I18n,
): Record<string, ToolDefinition> {
  const baseI18n = i18n ?? createI18n(resolveLanguage(null));
  const i18nPromise = i18n
    ? Promise.resolve(i18n)
    : loadMimicConfig()
        .then((config) => createI18n(resolveLanguage(config)))
        .catch(() => createI18n(resolveLanguage(null)));

  return {
    "mimic:init": tool({
      description: baseI18n.t("tool.init.description"),
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
      description: baseI18n.t("tool.status.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const ctx = { stateManager, directory, i18n };
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

        const suggestions = await surfacePatterns(ctx);
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
      description: baseI18n.t("tool.journey.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const ctx = { stateManager, directory, i18n };
        const state = await stateManager.read();
        const gitHistory = getGitHistory(directory, 10);
        return formatJourney(ctx, state, gitHistory);
      },
    }),

    "mimic:patterns": tool({
      description: baseI18n.t("tool.patterns.description"),
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

    "mimic:observe": tool({
      description: baseI18n.t("tool.observe.description"),
      args: {
        observation: tool.schema.string().describe(baseI18n.t("tool.observe.args.observation")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        await stateManager.addObservation(args.observation);
        return i18n.t("observe.recorded", { observation: args.observation });
      },
    }),

    "mimic:milestone": tool({
      description: baseI18n.t("tool.milestone.description"),
      args: {
        milestone: tool.schema.string().describe(baseI18n.t("tool.milestone.args.milestone")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        await stateManager.addMilestone(args.milestone);
        return i18n.t("milestone.recorded", { milestone: args.milestone });
      },
    }),

    "mimic:stats": tool({
      description: baseI18n.t("tool.stats.description"),
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
      description: baseI18n.t("tool.configure.description"),
      args: {
        learningEnabled: tool.schema
          .boolean()
          .optional()
          .describe(baseI18n.t("tool.configure.args.learningEnabled")),
        suggestionEnabled: tool.schema
          .boolean()
          .optional()
          .describe(baseI18n.t("tool.configure.args.suggestionEnabled")),
        minPatternCount: tool.schema
          .number()
          .optional()
          .describe(baseI18n.t("tool.configure.args.minPatternCount")),
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

    "mimic:surface": tool({
      description: baseI18n.t("tool.surface.description"),
      args: {
        patternId: tool.schema.string().describe(baseI18n.t("tool.surface.args.patternId")),
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

    "mimic:reset": tool({
      description: baseI18n.t("tool.reset.description"),
      args: {
        confirm: tool.schema.boolean().describe(baseI18n.t("tool.reset.args.confirm")),
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

    "mimic:grow": tool({
      description: baseI18n.t("tool.grow.description"),
      args: {},
      async execute() {
        const i18n = await i18nPromise;
        const ctx = { stateManager, directory, i18n };
        const state = await stateManager.read();
        const gitHistory = getGitHistory(directory, 20);
        const recentFiles = getRecentlyModifiedFiles(directory);
        return formatGrowAnalysis(ctx, state, gitHistory, recentFiles);
      },
    }),

    "mimic:evolve": tool({
      description: baseI18n.t("tool.evolve.description"),
      args: {
        accept: tool.schema.string().optional().describe(baseI18n.t("tool.evolve.args.accept")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const ctx = { stateManager, directory, i18n };
        if (args.accept) {
          const suggestions = await getEvolutionSuggestions(ctx);
          const suggestion = suggestions.find((s) => s.pattern.id === args.accept);
          if (!suggestion) {
            return i18n.t("evolve.no_pattern", { id: args.accept });
          }
          const { capability, filePath } = await evolveCapability(ctx, suggestion);
          return `${i18n.t("evolve.absorbed_header")}\n\n${formatEvolutionResult(
            ctx,
            capability,
            filePath,
          )}`;
        }

        const suggestions = await getEvolutionSuggestions(ctx);
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

    "mimic:level": tool({
      description: baseI18n.t("tool.level.description"),
      args: {
        level: tool.schema
          .enum(["technical", "semi-technical", "non-technical", "chaotic"])
          .describe(baseI18n.t("tool.level.args.level")),
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
      description: baseI18n.t("tool.focus.description"),
      args: {
        focus: tool.schema.string().optional().describe(baseI18n.t("tool.focus.args.focus")),
        stack: tool.schema.string().optional().describe(baseI18n.t("tool.focus.args.stack")),
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

    "mimic:mcp-search": tool({
      description: baseI18n.t("tool.mcp_search.description"),
      args: {
        query: tool.schema.string().describe(baseI18n.t("tool.mcp_search.args.query")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const searchUrl = `https://mcpmarket.com/search?q=${encodeURIComponent(args.query)}`;
        const popular = [
          {
            name: "context7",
            desc: i18n.t("mcp_search.desc.context7"),
            url: "https://mcp.context7.com/mcp",
          },
          {
            name: "github",
            desc: i18n.t("mcp_search.desc.github"),
            url: "https://mcp.github.com",
          },
          {
            name: "supabase",
            desc: i18n.t("mcp_search.desc.supabase"),
            url: "https://mcp.supabase.com",
          },
          { name: "playwright", desc: i18n.t("mcp_search.desc.playwright") },
          { name: "firecrawl", desc: i18n.t("mcp_search.desc.firecrawl") },
        ];
        const popularLines = popular
          .map((server) =>
            server.url
              ? `- **${server.name}** - ${server.desc}: \`${server.url}\``
              : `- **${server.name}** - ${server.desc}`,
          )
          .join("\n");
        return `${i18n.t("mcp_search.header", {
          query: args.query,
          url: searchUrl,
        })}\n\n${i18n.t("mcp_search.popular")}\n${popularLines}\n\n${i18n.t("mcp_search.add")}`;
      },
    }),

    "mimic:mcp": tool({
      description: baseI18n.t("tool.mcp.description"),
      args: {
        name: tool.schema.string().describe(baseI18n.t("tool.mcp.args.name")),
        url: tool.schema.string().optional().describe(baseI18n.t("tool.mcp.args.url")),
        command: tool.schema.string().optional().describe(baseI18n.t("tool.mcp.args.command")),
      },
      async execute(args) {
        const i18n = await i18nPromise;
        const { existsSync } = await import("node:fs");
        const { readFile, writeFile: fsWriteFile, mkdir } = await import("node:fs/promises");
        const { join } = await import("node:path");

        const opencodeDir = join(directory, ".opencode");
        if (!existsSync(opencodeDir)) {
          await mkdir(opencodeDir, { recursive: true });
        }

        const configPath = join(directory, "opencode.json");
        let config: Record<string, unknown> = {};
        if (existsSync(configPath)) {
          try {
            config = JSON.parse(await readFile(configPath, "utf-8"));
          } catch {
            config = {};
          }
        }

        const mcpEntry: Record<string, unknown> = {};
        if (args.url) {
          mcpEntry.type = "remote";
          mcpEntry.url = args.url;
        } else if (args.command) {
          mcpEntry.type = "local";
          mcpEntry.command = args.command.split(",").map((s) => s.trim());
        } else {
          return i18n.t("mcp.need_url_or_command");
        }
        mcpEntry.enabled = true;

        config.mcp = { ...((config.mcp as Record<string, unknown>) || {}), [args.name]: mcpEntry };
        await fsWriteFile(configPath, JSON.stringify(config, null, 2));

        await stateManager.addMilestone(i18n.t("milestone.mcp_added", { name: args.name }));

        return i18n.t("mcp.added", { name: args.name });
      },
    }),

    "mimic:capabilities": tool({
      description: baseI18n.t("tool.capabilities.description"),
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
}
