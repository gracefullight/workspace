import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type InformationParams,
  InformationParamsSchema,
  type InformationUpdateParams,
  InformationUpdateParamsSchema,
} from "@/schemas/information.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";
import type { StoreInformation } from "../types.js";

async function cafe24_get_information(params: InformationParams) {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest<{ information: StoreInformation[] }>(
      "/admin/information",
      "GET",
      undefined,
      queryParams,
    );
    const informations = data.information || [];

    const typeLabels: Record<string, string> = {
      JOIN: "Member Registration",
      ORDER: "Order",
      PAYMENT: "Payment",
      SHIPPING: "Shipping",
      EXCHANGE: "Exchange",
      REFUND: "Refund",
      POINT: "Points & Mileage",
      SHIPPING_INFORMATION: "Shipping Info Policy",
    };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Information Settings (${informations.length} items)\n\n` +
            informations
              .map(
                (info) =>
                  `### ${typeLabels[info.type] || info.type}\n` +
                  `- **Type**: ${info.type}\n` +
                  `- **Mobile Display**: ${info.display_mobile === "T" ? "Yes" : info.display_mobile === "F" ? "No" : "N/A"}\n` +
                  `- **Enabled**: ${info.use === "T" ? "Yes" : info.use === "F" ? "No" : "N/A"}\n` +
                  `- **Content**: ${info.content ? info.content.substring(0, 100) + (info.content.length > 100 ? "..." : "") : "N/A"}\n\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: informations.length,
        information: informations.map((info) => ({
          shop_no: info.shop_no,
          type: info.type,
          type_label: typeLabels[info.type] || info.type,
          display_mobile: info.display_mobile,
          use: info.use,
          content: info.content,
        })),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_information(params: InformationUpdateParams) {
  try {
    const { shop_no, requests } = params;

    const requestBody: Record<string, unknown> = {
      shop_no: shop_no ?? 1,
      requests,
    };

    const data = await makeApiRequest<{ information: StoreInformation[] }>(
      "/admin/information",
      "PUT",
      requestBody,
    );
    const informations = data.information || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Information Updated (${informations.length} items)\n\n` +
            informations
              .map((info) => `- **${info.type}**: ${info.use === "T" ? "Enabled" : "Updated"}\n`)
              .join(""),
        },
      ],
      structuredContent: {
        count: informations.length,
        information: informations,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_information",
    {
      title: "Get Cafe24 Information Settings",
      description:
        "Retrieve shop information/guide settings including JOIN (member registration), ORDER, PAYMENT, SHIPPING, EXCHANGE, REFUND, POINT, and SHIPPING_INFORMATION types with their content and display options.",
      inputSchema: InformationParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_information,
  );

  server.registerTool(
    "cafe24_update_information",
    {
      title: "Update Cafe24 Information Settings",
      description:
        "Update shop information/guide settings. Supports types: JOIN, ORDER, PAYMENT, SHIPPING, EXCHANGE, REFUND, POINT, SHIPPING_INFORMATION. Can set display_mobile, use, save_type (S=Standard, C=Custom), and content.",
      inputSchema: InformationUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_information,
  );
}
