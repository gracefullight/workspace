import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type DatabridgeLogsSearchParams,
  DatabridgeLogsSearchParamsSchema,
} from "@/schemas/databridge-logs.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type { DatabridgeLog, DatabridgeLogsResponse } from "@/types/index.js";

function formatPayload(label: string, payload?: string | null): string {
  if (!payload) {
    return `- **${label}**: N/A\n`;
  }

  const trimmed = payload.trim();
  if (!trimmed) {
    return `- **${label}**: N/A\n`;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return `- **${label}**:\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`\n`;
  } catch {
    return `- **${label}**: ${payload}\n`;
  }
}

function formatDatabridgeLog(log: DatabridgeLog): string {
  return (
    `## Log ${log.log_id}\n` +
    `- **Mall ID**: ${log.mall_id}\n` +
    `- **Trace ID**: ${log.trace_id}\n` +
    `- **Requested Time**: ${log.requested_time}\n` +
    `- **Endpoint**: ${log.request_endpoint}\n` +
    `- **Success**: ${log.success === "T" ? "Yes" : "No"}\n` +
    `- **Response HTTP**: ${log.response_http_code}\n` +
    formatPayload("Request Body", log.request_body) +
    formatPayload("Response Body", log.response_body)
  );
}

async function cafe24_list_databridge_logs(params: DatabridgeLogsSearchParams) {
  try {
    const data = await makeApiRequest<DatabridgeLogsResponse>(
      "/admin/databridge/logs",
      "GET",
      undefined,
      params,
    );

    const logs = data.logs || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `# Databridge Logs (${logs.length})\n\n` +
            (logs.length > 0
              ? logs.map(formatDatabridgeLog).join("\n")
              : "No databridge logs found."),
        },
      ],
      structuredContent: {
        count: logs.length,
        logs,
        links: data.links,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_databridge_logs",
    {
      title: "List Cafe24 Databridge Logs",
      description: "Retrieve databridge webhook delivery logs with optional filters.",
      inputSchema: DatabridgeLogsSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_list_databridge_logs,
  );
}
