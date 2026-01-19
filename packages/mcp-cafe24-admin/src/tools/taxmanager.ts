import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

const TaxManagerParamsSchema = z.object({}).strict();

async function cafe24_get_tax_manager_setting(_params: z.infer<typeof TaxManagerParamsSchema>) {
  try {
    const data = await makeApiRequest("/admin/taxmanager", "GET");
    const taxmanager = data.taxmanager || data;

    return {
      content: [
        {
          type: "text" as const,
          text: `## Tax Manager Setting\n\n- **Usage Status**: ${taxmanager.use === "T" ? "Enabled" : "Disabled"}\n`,
        },
      ],
      structuredContent: taxmanager,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_tax_manager_setting",
    {
      title: "Get Cafe24 Tax Manager Settings",
      description: "Retrieve Tax Manager activation status.",
      inputSchema: TaxManagerParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_tax_manager_setting,
  );
}
