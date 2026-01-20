import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CouponCreateParams,
  CouponCreateParamsSchema,
  type CouponDetailParams,
  CouponDetailParamsSchema,
  type CouponsSearchParams,
  CouponsSearchParamsSchema,
} from "@/schemas/coupon.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";
import type { Benefit, Coupon } from "../types.js";

async function cafe24_list_coupons(params: CouponsSearchParams) {
  try {
    const data = await makeApiRequest<{ benefits: Benefit[]; total: number }>(
      "/admin/benefits",
      "GET",
      undefined,
      {
        limit: params.limit,
        offset: params.offset,
        ...(params.benefit_no ? { benefit_no: params.benefit_no } : {}),
      },
    );

    const benefits = data.benefits || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} benefits/coupons (showing ${benefits.length})\n\n` +
            benefits
              .map((b) => `## ${b.benefit_name || "Benefit"}\n- **Benefit No**: ${b.benefit_no}\n`)
              .join(""),
        },
      ],
      structuredContent: {
        total,
        count: benefits.length,
        offset: params.offset,
        benefits: benefits.map((b) => ({
          id: b.benefit_no.toString(),
          name: b.benefit_name,
        })),
        has_more: total > params.offset + benefits.length,
        ...(total > params.offset + benefits.length
          ? { next_offset: params.offset + benefits.length }
          : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_coupon(params: CouponDetailParams) {
  try {
    const data = await makeApiRequest<{ coupon: Coupon }>(
      `/admin/coupons/${params.coupon_no}`,
      "GET",
    );
    const coupon = data.coupon || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Coupon Details\n\n- **Coupon No**: ${coupon.coupon_no}\n- **Coupon Name**: ${coupon.coupon_name}\n`,
        },
      ],
      structuredContent: {
        id: coupon.coupon_no,
        name: coupon.coupon_name,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_coupon(params: CouponCreateParams) {
  try {
    const data = await makeApiRequest<{ coupon: Coupon }>("/admin/coupons", "POST", params);
    const coupon = data.coupon || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Coupon created successfully\n\n- **Coupon No**: ${coupon.coupon_no}\n- **Coupon Name**: ${coupon.coupon_name}\n`,
        },
      ],
      structuredContent: {
        id: coupon.coupon_no,
        name: coupon.coupon_name,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_coupons",
    {
      title: "List Cafe24 Benefits/Coupons",
      description:
        "Retrieve a list of benefits/coupons from Cafe24. Returns benefit/coupon details including number, name, and validity period. Supports pagination and filtering by benefit number.",
      inputSchema: CouponsSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_coupons,
  );

  server.registerTool(
    "cafe24_get_coupon",
    {
      title: "Get Cafe24 Coupon Details",
      description:
        "Retrieve detailed information about a specific coupon by coupon number. Returns complete coupon details including name and validity.",
      inputSchema: CouponDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_coupon,
  );

  server.registerTool(
    "cafe24_create_coupon",
    {
      title: "Create Cafe24 Coupon",
      description:
        "Create a new coupon/benefit in Cafe24. Requires benefit number, coupon number, type, name, validity period, discount value, and optionally issuance limit.",
      inputSchema: CouponCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_coupon,
  );
}
