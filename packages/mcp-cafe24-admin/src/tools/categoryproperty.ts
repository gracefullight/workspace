import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CreateCategoryProperty,
  CreateCategoryPropertySchema,
  type ListCategoryProperties,
  ListCategoryPropertiesSchema,
  type UpdateCategoryProperties,
  UpdateCategoryPropertiesSchema,
} from "@/schemas/categoryproperty.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

async function cafe24_list_category_properties(params: ListCategoryProperties) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      "/admin/categories/properties",
      "GET",
      undefined,
      queryParams as Record<string, any>,
      requestHeaders,
    );

    const category = data.category || {};
    const properties = category.properties || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${properties.length} category properties.\n` +
            `Display Group: ${category.display_group}\n` +
            `Separated Category: ${category.separated_category}\n\n` +
            properties
              .map(
                (p: any) =>
                  `- Key: ${p.key}\n` +
                  `  Name: ${p.name}\n` +
                  `  Display: ${p.display === "T" ? "Yes" : "No"}\n` +
                  `  Display Name: ${p.display_name === "T" ? "Yes" : "No"}\n` +
                  `  Font: ${p.font_type} / ${p.font_size}px / ${p.font_color}\n`,
              )
              .join("\n"),
        },
      ],
      structuredContent: {
        properties,
        meta: {
          display_group: category.display_group,
          separated_category: category.separated_category,
          category_no: category.category_no,
        },
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_category_property(params: CreateCategoryProperty) {
  try {
    const { shop_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      request: {
        property: requestBody,
      },
    };

    const data = await makeApiRequest(
      "/admin/categories/properties",
      "POST",
      payload,
      undefined,
      requestHeaders,
    );

    const result = data?.category?.property || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Created custom category property: ${result.key}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_category_properties(params: UpdateCategoryProperties) {
  try {
    const { shop_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest(
      "/admin/categories/properties",
      "PUT",
      payload,
      undefined,
      requestHeaders,
    );

    const result = data.category || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated category properties.\nDisplay Group: ${result.display_group}\nCount: ${result.properties?.length || 0}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_category_properties",
    {
      title: "List Category Properties",
      description: "Retrieve category properties configurations",
      inputSchema: ListCategoryPropertiesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_category_properties,
  );

  server.registerTool(
    "cafe24_create_category_property",
    {
      title: "Create Category Property",
      description: "Create a custom category property",
      inputSchema: CreateCategoryPropertySchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_create_category_property,
  );

  server.registerTool(
    "cafe24_update_category_properties",
    {
      title: "Update Category Properties",
      description: "Update category properties configurations",
      inputSchema: UpdateCategoryPropertiesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_category_properties,
  );
}
