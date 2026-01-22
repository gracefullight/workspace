import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CategoriesCountParams,
  CategoriesCountParamsSchema,
  type CategoriesSearchParams,
  CategoriesSearchParamsSchema,
  type CategoryCreateParams,
  CategoryCreateParamsSchema,
  type CategoryDeleteParams,
  CategoryDeleteParamsSchema,
  type CategoryDetailParams,
  CategoryDetailParamsSchema,
  type CategoryUpdateParams,
  CategoryUpdateParamsSchema,
} from "@/schemas/categories.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type {
  CategoriesCountResponse,
  CategoriesListResponse,
  CategoryDeleteResponse,
  CategoryResponse,
  ProductCategory,
} from "@/types/index.js";

function formatCategoryDetails(category: ProductCategory): string {
  const parent = category.parent_category_no ?? "None";
  const useMain = category.use_main ? (category.use_main === "T" ? "Yes" : "No") : "N/A";
  const useDisplay = category.use_display ? (category.use_display === "T" ? "Yes" : "No") : "N/A";

  return (
    `## ${category.category_name} (${category.category_no})\n` +
    `- **Depth**: ${category.category_depth}\n` +
    `- **Parent**: ${parent}\n` +
    `- **Use Main**: ${useMain}\n` +
    `- **Use Display**: ${useDisplay}\n`
  );
}

async function cafe24_list_categories(params: CategoriesSearchParams) {
  try {
    const { shop_no, ...queryParams } = params;
    const data = await makeApiRequest<CategoriesListResponse>(
      "/admin/categories",
      "GET",
      undefined,
      {
        shop_no: shop_no || 1,
        ...queryParams,
      },
    );

    const categories = data.categories || [];
    const total = typeof data.total === "number" ? data.total : categories.length;
    const hasMore =
      typeof data.total === "number" ? data.total > params.offset + categories.length : false;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} categories (showing ${categories.length})\n\n` +
            categories.map((category) => formatCategoryDetails(category)).join(""),
        },
      ],
      structuredContent: {
        total,
        count: categories.length,
        offset: params.offset,
        categories,
        has_more: hasMore,
        ...(hasMore ? { next_offset: params.offset + categories.length } : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_count_categories(params: CategoriesCountParams) {
  try {
    const { shop_no, ...queryParams } = params;
    const data = await makeApiRequest<CategoriesCountResponse>(
      "/admin/categories/count",
      "GET",
      undefined,
      {
        shop_no: shop_no || 1,
        ...queryParams,
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Total categories count: ${data.count}`,
        },
      ],
      structuredContent: {
        count: data.count,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_category(params: CategoryDetailParams) {
  try {
    const { shop_no, category_no } = params;
    const data = await makeApiRequest<CategoryResponse>(
      `/admin/categories/${category_no}`,
      "GET",
      undefined,
      { shop_no: shop_no || 1 },
    );

    const category = data.category;

    return {
      content: [
        {
          type: "text" as const,
          text: `Category Details\n\n${formatCategoryDetails(category)}`,
        },
      ],
      structuredContent: {
        category,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_category(params: CategoryCreateParams) {
  try {
    const { shop_no, request } = params;
    const data = await makeApiRequest<CategoryResponse>("/admin/categories", "POST", {
      shop_no: shop_no || 1,
      request,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Category created: ${data.category.category_name} (${data.category.category_no})`,
        },
      ],
      structuredContent: {
        category: data.category,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_category(params: CategoryUpdateParams) {
  try {
    const { shop_no, category_no, request } = params;
    const data = await makeApiRequest<CategoryResponse>(`/admin/categories/${category_no}`, "PUT", {
      shop_no: shop_no || 1,
      request,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Category updated: ${data.category.category_name} (${data.category.category_no})`,
        },
      ],
      structuredContent: {
        category: data.category,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_category(params: CategoryDeleteParams) {
  try {
    const { shop_no, category_no } = params;
    const data = await makeApiRequest<CategoryDeleteResponse>(
      `/admin/categories/${category_no}`,
      "DELETE",
      undefined,
      { shop_no: shop_no || 1 },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Category deleted: ${data.category.category_no}`,
        },
      ],
      structuredContent: {
        category: data.category,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_categories",
    {
      title: "List Cafe24 Product Categories",
      description:
        "Retrieve a list of product categories from Cafe24. Supports pagination and filters like depth, parent category, and display status.",
      inputSchema: CategoriesSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_categories,
  );

  server.registerTool(
    "cafe24_count_categories",
    {
      title: "Count Cafe24 Product Categories",
      description: "Get the total count of product categories matching the criteria.",
      inputSchema: CategoriesCountParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_categories,
  );

  server.registerTool(
    "cafe24_get_category",
    {
      title: "Get Cafe24 Product Category",
      description: "Retrieve a single product category by category number.",
      inputSchema: CategoryDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_category,
  );

  server.registerTool(
    "cafe24_create_category",
    {
      title: "Create Cafe24 Product Category",
      description: "Create a new product category.",
      inputSchema: CategoryCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_create_category,
  );

  server.registerTool(
    "cafe24_update_category",
    {
      title: "Update Cafe24 Product Category",
      description: "Update an existing product category by category number.",
      inputSchema: CategoryUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_category,
  );

  server.registerTool(
    "cafe24_delete_category",
    {
      title: "Delete Cafe24 Product Category",
      description: "Delete a product category by category number.",
      inputSchema: CategoryDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_delete_category,
  );
}
