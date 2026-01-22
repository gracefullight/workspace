import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CountClassifications,
  CountClassificationsSchema,
  type ListClassifications,
  ListClassificationsSchema,
} from "@/schemas/classification.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type { ClassificationCountResponse, ClassificationsResponse } from "@/types/index.js";

async function cafe24_list_classifications(params: ListClassifications) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ClassificationsResponse>(
      "/admin/classifications",
      "GET",
      undefined,
      queryParams as Record<string, unknown>,
      requestHeaders,
    );

    const classifications = data.classifications || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${classifications.length} classifications.\n\n` +
            classifications
              .map(
                (c) =>
                  `- [${c.classification_code}] ${c.classification_name}\n  Used: ${c.use_classification === "T" ? "Yes" : "No"}, Products: ${c.product_count ?? 0}\n  Description: ${c.classification_description ?? "N/A"}`,
              )
              .join("\n"),
        },
      ],
      structuredContent: { classifications },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_count_classifications(params: CountClassifications) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ClassificationCountResponse>(
      "/admin/classifications/count",
      "GET",
      undefined,
      queryParams as Record<string, unknown>,
      requestHeaders,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Total classification count: ${data.count}`,
        },
      ],
      structuredContent: { count: data.count },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_classifications",
    {
      title: "List Classifications",
      description: "Retrieve a list of classifications",
      inputSchema: ListClassificationsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_classifications,
  );

  server.registerTool(
    "cafe24_count_classifications",
    {
      title: "Count Classifications",
      description: "Retrieve the count of classifications",
      inputSchema: CountClassificationsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_classifications,
  );
}
