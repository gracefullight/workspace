import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import {
  ProductMemoCreateParamsSchema,
  ProductMemoDeleteParamsSchema,
  ProductMemoGetParamsSchema,
  ProductMemosListParamsSchema,
  ProductMemoUpdateParamsSchema,
} from "../schemas/product-memos.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

interface ProductMemo {
  memo_no: number;
  author_id: string;
  created_date: string;
  memo: string;
}

interface ProductMemosResponse {
  memos: ProductMemo[];
}

interface ProductMemoResponse {
  memo: ProductMemo;
}

interface ProductMemoDeleteResponse {
  memo: { memo_no: number };
}

async function cafe24_list_product_memos(params: z.infer<typeof ProductMemosListParamsSchema>) {
  try {
    const { shop_no, product_no, offset, limit } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const queryParams: Record<string, unknown> = {};
    if (offset !== undefined) queryParams.offset = offset;
    if (limit !== undefined) queryParams.limit = limit;

    const data = await makeApiRequest<ProductMemosResponse>(
      `/admin/products/${product_no}/memos`,
      "GET",
      undefined,
      queryParams,
      requestHeaders,
    );

    const memos = data.memos || [];

    const content =
      memos.length > 0
        ? `Found ${memos.length} memo(s) for product ${product_no}\n\n` +
          memos
            .map(
              (memo) =>
                `**Memo #${memo.memo_no}**\n` +
                `- Author: ${memo.author_id}\n` +
                `- Created: ${memo.created_date}\n` +
                `- Content: ${memo.memo}`,
            )
            .join("\n\n")
        : `No memos found for product ${product_no}`;

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { memos } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_product_memo(params: z.infer<typeof ProductMemoGetParamsSchema>) {
  try {
    const { shop_no, product_no, memo_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ProductMemoResponse>(
      `/admin/products/${product_no}/memos/${memo_no}`,
      "GET",
      undefined,
      undefined,
      requestHeaders,
    );

    const memo = data.memo;

    const content =
      `**Memo #${memo.memo_no}**\n` +
      `- Author: ${memo.author_id}\n` +
      `- Created: ${memo.created_date}\n` +
      `- Content: ${memo.memo}`;

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { memo } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_product_memo(params: z.infer<typeof ProductMemoCreateParamsSchema>) {
  try {
    const { shop_no, product_no, author_id, memo } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      request: {
        author_id,
        memo,
      },
    };

    const data = await makeApiRequest<ProductMemoResponse>(
      `/admin/products/${product_no}/memos`,
      "POST",
      payload,
      undefined,
      requestHeaders,
    );

    const createdMemo = data.memo;

    const content =
      `Created memo #${createdMemo.memo_no} for product ${product_no}\n` +
      `- Author: ${createdMemo.author_id}\n` +
      `- Created: ${createdMemo.created_date}\n` +
      `- Content: ${createdMemo.memo}`;

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { memo: createdMemo } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_memo(params: z.infer<typeof ProductMemoUpdateParamsSchema>) {
  try {
    const { shop_no, product_no, memo_no, author_id, memo } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      request: {
        author_id,
        memo,
      },
    };

    const data = await makeApiRequest<ProductMemoResponse>(
      `/admin/products/${product_no}/memos/${memo_no}`,
      "PUT",
      payload,
      undefined,
      requestHeaders,
    );

    const updatedMemo = data.memo;

    const content =
      `Updated memo #${updatedMemo.memo_no} for product ${product_no}\n` +
      `- Author: ${updatedMemo.author_id}\n` +
      `- Created: ${updatedMemo.created_date}\n` +
      `- Content: ${updatedMemo.memo}`;

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { memo: updatedMemo } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_product_memo(params: z.infer<typeof ProductMemoDeleteParamsSchema>) {
  try {
    const { shop_no, product_no, memo_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ProductMemoDeleteResponse>(
      `/admin/products/${product_no}/memos/${memo_no}`,
      "DELETE",
      undefined,
      undefined,
      requestHeaders,
    );

    const deletedMemoNo = data.memo?.memo_no || memo_no;

    return {
      content: [
        {
          type: "text" as const,
          text: `Deleted memo #${deletedMemoNo} from product ${product_no}`,
        },
      ],
      structuredContent: { memo: { memo_no: deletedMemoNo } } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_product_memos",
    {
      title: "List Product Memos",
      description:
        "Retrieve memos attached to a product. Memos contain notes written by administrators about the product.",
      inputSchema: ProductMemosListParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_product_memos,
  );

  server.registerTool(
    "cafe24_get_product_memo",
    {
      title: "Get Product Memo",
      description: "Retrieve a specific memo attached to a product by memo number.",
      inputSchema: ProductMemoGetParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_product_memo,
  );

  server.registerTool(
    "cafe24_create_product_memo",
    {
      title: "Create Product Memo",
      description:
        "Create a new memo for a product. Requires author_id and memo content. HTML is supported in memo content.",
      inputSchema: ProductMemoCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_product_memo,
  );

  server.registerTool(
    "cafe24_update_product_memo",
    {
      title: "Update Product Memo",
      description:
        "Update an existing memo for a product. Requires author_id and memo content. HTML is supported in memo content.",
      inputSchema: ProductMemoUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_memo,
  );

  server.registerTool(
    "cafe24_delete_product_memo",
    {
      title: "Delete Product Memo",
      description: "Delete a specific memo from a product.",
      inputSchema: ProductMemoDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_delete_product_memo,
  );
}
