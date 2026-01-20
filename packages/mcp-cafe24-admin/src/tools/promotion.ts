import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type PromotionCreateParams,
  PromotionCreateParamsSchema,
  type PromotionDetailParams,
  PromotionDetailParamsSchema,
  type PromotionSearchParams,
  PromotionSearchParamsSchema,
} from "@/schemas/promotion.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";
import type { Promotion } from "../types.js";

async function cafe24_list_promotions(params: PromotionSearchParams) {
  try {
    const data = await makeApiRequest<{ promotions: Promotion[]; total: number }>(
      "/admin/promotions",
      "GET",
      undefined,
      {
        limit: params.limit,
        offset: params.offset,
        ...(params.benefit_no ? { benefit_no: params.benefit_no } : {}),
      },
    );

    const promotions = data.promotions || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} promotions (showing ${promotions.length})\n\n` +
            promotions
              .map((p) => `## ${p.promotion_name || "Promotion"} (No: ${p.promotion_no})\n`)
              .join(""),
        },
      ],
      structuredContent: {
        total,
        count: promotions.length,
        offset: params.offset,
        promotions: promotions.map((p) => ({
          id: p.promotion_no.toString(),
          name: p.promotion_name,
        })),
        has_more: total > params.offset + promotions.length,
        ...(total > params.offset + promotions.length
          ? { next_offset: params.offset + promotions.length }
          : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_promotion(params: PromotionDetailParams) {
  try {
    const data = await makeApiRequest<{ promotion: Promotion }>(
      `/admin/promotions/${params.promotion_no}`,
      "GET",
    );
    const promotion = data.promotion || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Promotion Details\n\n- **Promotion No**: ${promotion.promotion_no}\n- **Name**: ${promotion.promotion_name}\n`,
        },
      ],
      structuredContent: {
        id: promotion.promotion_no.toString(),
        name: promotion.promotion_name,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_promotion(params: PromotionCreateParams) {
  try {
    const data = await makeApiRequest<{ promotion: Promotion }>(
      "/admin/promotions",
      "POST",
      params,
    );
    const promotion = data.promotion || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Promotion created successfully\n\n- **Promotion No**: ${promotion.promotion_no}\n- **Name**: ${promotion.promotion_name}\n`,
        },
      ],
      structuredContent: {
        id: promotion.promotion_no.toString(),
        name: promotion.promotion_name,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_promotions",
    {
      title: "List Cafe24 Promotions",
      description:
        "Retrieve a list of promotions from Cafe24. Returns promotion details including number and name. Supports pagination and filtering by benefit number.",
      inputSchema: PromotionSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_promotions,
  );

  server.registerTool(
    "cafe24_get_promotion",
    {
      title: " Get Cafe24 Promotion Details",
      description:
        "Retrieve detailed information about a specific promotion by promotion number. Returns complete promotion details including name and validity.",
      inputSchema: PromotionDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_promotion,
  );

  server.registerTool(
    "cafe24_create_promotion",
    {
      title: "Create Cafe24 Promotion",
      description:
        "Create a new promotion in Cafe24. Requires promotion number, name, apply method, start/end dates, and discount details.",
      inputSchema: PromotionCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_promotion,
  );
}
