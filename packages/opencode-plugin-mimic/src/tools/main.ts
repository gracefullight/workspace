import type { ToolDefinition } from "@opencode-ai/plugin";
import type { StateManager } from "@/core/state";
import { createI18n, type I18n, loadMimicConfig, resolveLanguage } from "@/lib/i18n";
import { createAutomationTools } from "@/tools/automation";
import { createCoreTools } from "@/tools/core";
import { createEvolutionTools } from "@/tools/evolution";
import { createInstinctTools } from "@/tools/instincts";
import { createMcpTools } from "@/tools/mcp";
import { createObservationTools } from "@/tools/observation";
import { type ToolFactoryContext, ToolRegistry } from "@/tools/registry";
import { createSettingsTools } from "@/tools/settings";
import type { ToolCall } from "@/types";

/**
 * Create the default tool registry with all standard tools
 */
function createDefaultRegistry(): ToolRegistry {
  return new ToolRegistry()
    .register(createCoreTools)
    .register(createSettingsTools)
    .register(createEvolutionTools)
    .register(createInstinctTools)
    .register(createObservationTools)
    .register(createMcpTools)
    .register(createAutomationTools);
}

/**
 * Creates all Mimic tools using the registry pattern.
 *
 * @param stateManager - State manager instance
 * @param directory - Project directory path
 * @param toolCalls - Array of tool calls in current session
 * @param i18n - Optional i18n instance
 * @returns Record of tool definitions
 */
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

  const ctx: ToolFactoryContext = {
    stateManager,
    directory,
    toolCalls,
    i18n: baseI18n,
    i18nPromise,
  };

  const registry = createDefaultRegistry();
  return registry.build(ctx);
}
