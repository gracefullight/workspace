import type { ToolDefinition } from "@opencode-ai/plugin";
import type { StateManager } from "@/core/state";
import type { I18n } from "@/lib/i18n";
import type { ToolCall } from "@/types";

/**
 * Context passed to all tool factory functions
 */
export interface ToolFactoryContext {
  stateManager: StateManager;
  directory: string;
  toolCalls: ToolCall[];
  i18n: I18n;
  i18nPromise: Promise<I18n>;
}

/**
 * Tool factory function type
 */
export type ToolFactory = (ctx: ToolFactoryContext) => Record<string, ToolDefinition>;

/**
 * Tool registry for managing tool factories
 */
export class ToolRegistry {
  private factories: ToolFactory[] = [];

  /**
   * Register a tool factory
   */
  register(factory: ToolFactory): this {
    this.factories.push(factory);
    return this;
  }

  /**
   * Build all tools from registered factories
   */
  build(ctx: ToolFactoryContext): Record<string, ToolDefinition> {
    const tools: Record<string, ToolDefinition> = {};

    for (const factory of this.factories) {
      const factoryTools = factory(ctx);
      Object.assign(tools, factoryTools);
    }

    return tools;
  }
}

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();
