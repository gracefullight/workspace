import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

// --- JOIN ---
const PrivacyJoinParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

const PrivacyJoinUpdateItemSchema = z
  .object({
    no: z.number().int().min(1).describe("Agreement ID number"),
    use: z.enum(["T", "F"]).optional().describe("Enable agreement: T=Yes, F=No"),
    required: z.enum(["T", "F"]).optional().describe("Is required: T=Yes, F=No"),
    display: z
      .array(z.enum(["JOIN", "SIMPLE_ORDER_JOIN", "SHOPPING_PAY_EASY_JOIN"]))
      .optional()
      .describe(
        "Display screens: JOIN=Signup, SIMPLE_ORDER_JOIN=Order Simple Signup, SHOPPING_PAY_EASY_JOIN=Shopping Pay Easy Signup",
      ),
    save_type: z.enum(["S", "C"]).optional().describe("Save type: S=Standard, C=Custom"),
    content: z.string().optional().describe("Agreement content"),
  })
  .strict();

const PrivacyJoinUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    requests: z.array(PrivacyJoinUpdateItemSchema).min(1).describe("List of agreements to update"),
  })
  .strict();

async function cafe24_get_privacy_join_setting(params: z.infer<typeof PrivacyJoinParamsSchema>) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/privacy/join", "GET", undefined, queryParams);
    const agreements = data.join || [];

    const displayMap: Record<string, string> = {
      JOIN: "Membership Signup",
      SIMPLE_ORDER_JOIN: "Simple Order Signup",
      SHOPPING_PAY_EASY_JOIN: "Shopping Pay Easy Signup",
    };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Privacy Join Settings (${agreements.length} items)\n\n` +
            agreements
              .map(
                (item: any) =>
                  `### [${item.no}] ${item.name}\n` +
                  `- **Enabled**: ${item.use === "T" ? "Yes" : "No"}\n` +
                  `- **Required**: ${item.required === "T" ? "Yes" : "No"}\n` +
                  `- **Display On**: ${
                    item.display
                      ? item.display.map((d: string) => displayMap[d] || d).join(", ")
                      : "None"
                  }\n` +
                  `- **Content**: ${
                    item.content
                      ? item.content.substring(0, 100) + (item.content.length > 100 ? "..." : "")
                      : "No content"
                  }\n\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: agreements.length,
        items: agreements.map((item: any) => ({
          shop_no: item.shop_no,
          no: item.no,
          name: item.name,
          use: item.use,
          required: item.required,
          display: item.display,
          content: item.content,
        })),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_privacy_join_setting(
  params: z.infer<typeof PrivacyJoinUpdateParamsSchema>,
) {
  try {
    const { shop_no, requests } = params;

    const requestBody: Record<string, any> = {
      shop_no: shop_no ?? 1,
      requests,
    };

    const data = await makeApiRequest("/admin/privacy/join", "PUT", requestBody);
    const agreements = data.join || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Privacy Join Settings Updated (${agreements.length} items)\n\n` +
            agreements
              .map(
                (item: any) =>
                  `- **[${item.no}] ${item.name}**: ${item.use === "T" ? "Enabled" : "Disabled"}\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: agreements.length,
        items: agreements,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

// --- BOARDS ---
const PrivacyBoardsParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

const PrivacyBoardRequestSchema = z.object({
  no: z.number().int().min(1).describe("Agreement number"),
  use: z.enum(["T", "F"]).optional().describe("Use status: T=Yes, F=No"),
  save_type: z.enum(["S", "C"]).optional().describe("Save type: S=Standard terms, C=Custom terms"),
  content: z.string().optional().describe("Agreement content"),
});

const PrivacyBoardsUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
    requests: z.array(PrivacyBoardRequestSchema).describe("List of privacy board updates"),
  })
  .strict();

async function cafe24_list_privacy_boards(params: z.infer<typeof PrivacyBoardsParamsSchema>) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/privacy/boards", "GET", undefined, queryParams);
    const boards = data.boards || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${boards.length} privacy boards (Shop #${params.shop_no || 1})\n\n` +
            boards
              .map(
                (b: any) =>
                  `## ${b.name} (No: ${b.no})\n` +
                  `- **Use**: ${b.use === "T" ? "Yes" : "No"}\n` +
                  `- **Content**: ${
                    b.content ? `${b.content.substring(0, 100)}...` : "No content"
                  }\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: boards.length,
        boards: boards.map((b: any) => ({
          shop_no: b.shop_no,
          no: b.no,
          name: b.name,
          use: b.use,
          content: b.content,
        })),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_privacy_boards(
  params: z.infer<typeof PrivacyBoardsUpdateParamsSchema>,
) {
  try {
    const { shop_no, requests } = params;

    const data = await makeApiRequest("/admin/privacy/boards", "PUT", {
      shop_no,
      requests,
    });
    const boards = data.boards || [];

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated ${boards.length} privacy boards successfully.`,
        },
      ],
      structuredContent: {
        count: boards.length,
        boards: boards,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

// --- ORDERS ---
const PrivacyOrdersParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

const PrivacyOrderRequestSchema = z.object({
  no: z.number().int().min(1).describe("Agreement number"),
  use: z.enum(["T", "F"]).optional().describe("Use status: T=Yes, F=No"),
  use_member: z.enum(["T", "F"]).optional().describe("Use for members: T=Yes, F=No"),
  use_non_member: z.enum(["T", "F"]).optional().describe("Use for non-members: T=Yes, F=No"),
  save_type: z.enum(["S", "C"]).optional().describe("Save type: S=Standard, C=Custom"),
  content: z.string().optional().describe("Agreement content"),
});

const PrivacyOrdersUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
    requests: z.array(PrivacyOrderRequestSchema).describe("List of privacy order updates"),
  })
  .strict();

async function cafe24_list_privacy_orders(params: z.infer<typeof PrivacyOrdersParamsSchema>) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/privacy/orders", "GET", undefined, queryParams);
    const orders = data.orders || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${orders.length} order privacy agreements (Shop #${params.shop_no || 1})\n\n` +
            orders
              .map(
                (o: any) =>
                  `## ${o.name} (No: ${o.no})\n` +
                  `- **Use**: ${o.use === "T" ? "Yes" : "No"}\n` +
                  (o.use_member
                    ? `- **Member Use**: ${o.use_member === "T" ? "Yes" : "No"}\n`
                    : "") +
                  (o.use_non_member
                    ? `- **Non-Member Use**: ${o.use_non_member === "T" ? "Yes" : "No"}\n`
                    : "") +
                  `- **Content**: ${
                    o.content ? `${o.content.substring(0, 100)}...` : "No content"
                  }\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: orders.length,
        orders: orders.map((o: any) => ({
          shop_no: o.shop_no,
          no: o.no,
          name: o.name,
          use: o.use,
          use_member: o.use_member,
          use_non_member: o.use_non_member,
          content: o.content,
        })),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_privacy_orders(
  params: z.infer<typeof PrivacyOrdersUpdateParamsSchema>,
) {
  try {
    const { shop_no, requests } = params;
    const data = await makeApiRequest("/admin/privacy/orders", "PUT", {
      shop_no,
      requests,
    });
    const orders = data.orders || [];

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated ${orders.length} order privacy agreements successfully.`,
        },
      ],
      structuredContent: {
        count: orders.length,
        orders: orders,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  // JOIN
  server.registerTool(
    "cafe24_get_privacy_join_setting",
    {
      title: "Get Cafe24 Privacy Join Settings",
      description:
        "Retrieve privacy agreement settings for membership signup, simple order signup, and Shopping Pay easy signup processes.",
      inputSchema: PrivacyJoinParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_privacy_join_setting,
  );

  server.registerTool(
    "cafe24_update_privacy_join_setting",
    {
      title: "Update Cafe24 Privacy Join Settings",
      description:
        "Update privacy agreement settings. Configuration includes enabling/disabling specific agreements, setting them as required or optional, defining where they are displayed (signup, order, Shopping Pay), and updating the agreement content.",
      inputSchema: PrivacyJoinUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_privacy_join_setting,
  );

  // BOARDS
  server.registerTool(
    "cafe24_list_privacy_boards",
    {
      title: "List Cafe24 Privacy Boards",
      description:
        "Retrieve a list of privacy policy agreements for guest boards. Returns details including agreement number, name, use status, and content.",
      inputSchema: PrivacyBoardsParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_privacy_boards,
  );

  server.registerTool(
    "cafe24_update_privacy_boards",
    {
      title: "Update Cafe24 Privacy Boards",
      description:
        "Update privacy policy agreements for guest boards. Allows updating multiple agreements at once, including use status, save type (standard/custom), and content.",
      inputSchema: PrivacyBoardsUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_update_privacy_boards,
  );

  // ORDERS
  server.registerTool(
    "cafe24_list_privacy_orders",
    {
      title: "List Cafe24 Order Privacy Agreements",
      description:
        "Retrieve privacy policy agreements related to purchases (member/non-member) and personal ID collection (customs clearance).",
      inputSchema: PrivacyOrdersParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_privacy_orders,
  );

  server.registerTool(
    "cafe24_update_privacy_orders",
    {
      title: "Update Cafe24 Order Privacy Agreements",
      description:
        "Update privacy policy agreements for purchases and ID collection. Supports bulk updates of use status, member/non-member settings, save type, and content.",
      inputSchema: PrivacyOrdersUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_update_privacy_orders,
  );
}
