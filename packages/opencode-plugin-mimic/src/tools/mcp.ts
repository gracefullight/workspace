import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";
import type { ToolFactory } from "@/tools/registry";

/**
 * MCP tools: mcp-search, mcp
 */
export const createMcpTools: ToolFactory = (ctx) => {
  const { stateManager, directory, i18n, i18nPromise } = ctx;

  return {
    "mimic:mcp-search": tool({
      description: i18n.t("tool.mcp_search.description"),
      args: {
        query: tool.schema.string().describe(i18n.t("tool.mcp_search.args.query")),
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
      description: i18n.t("tool.mcp.description"),
      args: {
        name: tool.schema.string().describe(i18n.t("tool.mcp.args.name")),
        url: tool.schema.string().optional().describe(i18n.t("tool.mcp.args.url")),
        command: tool.schema.string().optional().describe(i18n.t("tool.mcp.args.command")),
      },
      async execute(args) {
        const i18n = await i18nPromise;

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
        await writeFile(configPath, JSON.stringify(config, null, 2));

        await stateManager.addMilestone(i18n.t("milestone.mcp_added", { name: args.name }));

        return i18n.t("mcp.added", { name: args.name });
      },
    }),
  };
};
