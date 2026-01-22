import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CreateMain,
  type CreateMainProperty,
  CreateMainPropertySchema,
  CreateMainSchema,
  type DeleteMain,
  DeleteMainSchema,
  type ListMainProperties,
  ListMainPropertiesSchema,
  type ListMains,
  ListMainsSchema,
  type MainSettingParams,
  MainSettingParamsSchema,
  type MainSettingUpdateParams,
  MainSettingUpdateParamsSchema,
  type UpdateMain,
  type UpdateMainProperties,
  UpdateMainPropertiesSchema,
  UpdateMainSchema,
} from "@/schemas/main.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type { DisplaySetting, Main, TextStyle } from "@/types/index.js";

async function cafe24_list_main_properties(params: ListMainProperties) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      "/admin/mains/properties",
      "GET",
      undefined,
      queryParams as Record<string, unknown>,
      requestHeaders,
    );

    const responseData = data as { main?: Record<string, unknown> };
    const main = responseData.main || {};
    const properties = (main.properties || []) as Record<string, unknown>[];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${properties.length} main properties.\n` +
            `Display Group: ${main.display_group}\n\n` +
            properties
              .map(
                (p) =>
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
          shop_no: main.shop_no,
          display_group: main.display_group,
        },
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_main_property(params: CreateMainProperty) {
  try {
    const { shop_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      request: {
        property: requestBody,
      },
    };

    const data = await makeApiRequest(
      "/admin/mains/properties",
      "POST",
      payload,
      undefined,
      requestHeaders,
    );

    const responseData = data as { main?: { property?: Record<string, unknown> } };
    const result = responseData?.main?.property || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Created custom main property: ${result.key}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_main_properties(params: UpdateMainProperties) {
  try {
    const { shop_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest(
      "/admin/mains/properties",
      "PUT",
      payload,
      undefined,
      requestHeaders,
    );

    const responseData = data as { main?: Record<string, unknown> };
    const result = (responseData.main || {}) as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated main properties.\nDisplay Group: ${result.display_group}\nCount: ${(result.properties as unknown[])?.length || 0}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_main_setting(params: MainSettingParams) {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest(
      "/admin/mains/properties/setting",
      "GET",
      undefined,
      queryParams,
    );
    const response = data as { main?: DisplaySetting };
    const main = (response.main || data) as DisplaySetting;

    const formatStyle = (style?: TextStyle) => {
      if (!style) return "N/A";
      const use = style.use === "T" ? "Enabled" : "Disabled";
      const type =
        style.font_type === "B"
          ? "Bold"
          : style.font_type === "I"
            ? "Italic"
            : style.font_type === "D"
              ? "Bold Italic"
              : "Normal";
      return `${use} | Color: ${style.color} | Size: ${style.font_size}px | Style: ${type}`;
    };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Main Product Properties Settings (Shop #${main.shop_no || 1})\n\n` +
            `- **Strikethrough Retail**: ${main.strikethrough_retail_price === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Strikethrough Price**: ${main.strikethrough_price === "T" ? "Enabled" : "Disabled"}\n\n` +
            `### Display Text Settings\n` +
            `- **Tax Type**: ${formatStyle(main.product_tax_type_text)}\n` +
            `- **Discount Price**: ${formatStyle(main.product_discount_price_text)}\n` +
            `- **Optimum Discount**: ${formatStyle(main.optimum_discount_price_text)}\n`,
        },
      ],
      structuredContent: {
        shop_no: main.shop_no ?? 1,
        strikethrough_retail_price: main.strikethrough_retail_price,
        strikethrough_price: main.strikethrough_price,
        product_tax_type_text: main.product_tax_type_text,
        product_discount_price_text: main.product_discount_price_text,
        optimum_discount_price_text: main.optimum_discount_price_text,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_main_setting(params: MainSettingUpdateParams) {
  try {
    const { shop_no, ...settings } = params;

    const requestBody: Record<string, unknown> = {
      shop_no: shop_no ?? 1,
      request: settings,
    };

    const data = await makeApiRequest<{ main: DisplaySetting } | DisplaySetting>(
      "/admin/mains/properties/setting",
      "PUT",
      requestBody,
    );
    const response = data as { main?: DisplaySetting };
    const main = (response.main || data) as DisplaySetting;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Main Settings Updated (Shop # ${(main as DisplaySetting).shop_no || 1})\n\n` +
            `- **Strikethrough Retail**: ${(main as DisplaySetting).strikethrough_retail_price === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Strikethrough Price**: ${(main as DisplaySetting).strikethrough_price === "T" ? "Enabled" : "Disabled"}\n`,
        },
      ],
      structuredContent: {
        shop_no: (main as DisplaySetting).shop_no ?? 1,
        strikethrough_retail_price: (main as DisplaySetting).strikethrough_retail_price,
        strikethrough_price: (main as DisplaySetting).strikethrough_price,
        product_tax_type_text: (main as DisplaySetting).product_tax_type_text,
        product_discount_price_text: (main as DisplaySetting).product_discount_price_text,
        optimum_discount_price_text: (main as DisplaySetting).optimum_discount_price_text,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_list_mains(params: ListMains) {
  try {
    const { shop_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      "/admin/mains",
      "GET",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const { mains = [] } = data as { mains: Main[] };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${mains.length} main display groups.\n\n` +
            mains
              .map(
                (m) =>
                  `- [${m.display_group}] ${m.group_name} (${m.module_code})\n  Sold-out: ${m.soldout_sort_type === "B" ? "Back" : "Normal"}, Auto Display: ${m.use_autodisplay === "T" ? "Yes" : "No"}`,
              )
              .join("\n"),
        },
      ],
      structuredContent: { mains },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_main(params: CreateMain) {
  try {
    const { shop_no, ...request } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      "/admin/mains",
      "POST",
      { shop_no, request },
      undefined,
      requestHeaders,
    );

    const { mains } = data as { mains: Main };

    return {
      content: [
        {
          type: "text" as const,
          text: `Created main display group: ${mains.group_name} (Display Group: ${mains.display_group})`,
        },
      ],
      structuredContent: mains,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_main(params: UpdateMain) {
  try {
    const { shop_no, display_group, ...request } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      `/admin/mains/${display_group}`,
      "PUT",
      { shop_no, request },
      undefined,
      requestHeaders,
    );

    const { mains } = data as { mains: Main };

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated main display group: ${mains.group_name} (Display Group: ${mains.display_group})`,
        },
      ],
      structuredContent: mains,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_main(params: DeleteMain) {
  try {
    const { shop_no, display_group } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest(
      `/admin/mains/${display_group}`,
      "DELETE",
      { shop_no },
      undefined,
      requestHeaders,
    );

    const { mains } = data as { mains: { display_group: number } };

    return {
      content: [
        {
          type: "text" as const,
          text: `Deleted main display group: ${mains.display_group}`,
        },
      ],
      structuredContent: mains,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_main_properties",
    {
      title: "List Main Properties",
      description: "Retrieve main display group properties configurations",
      inputSchema: ListMainPropertiesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_main_properties,
  );

  server.registerTool(
    "cafe24_create_main_property",
    {
      title: "Create Main Property",
      description: "Create a custom main display group property",
      inputSchema: CreateMainPropertySchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_create_main_property,
  );

  server.registerTool(
    "cafe24_update_main_properties",
    {
      title: "Update Main Properties",
      description: "Update main display group properties configurations",
      inputSchema: UpdateMainPropertiesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_main_properties,
  );

  server.registerTool(
    "cafe24_get_main_setting",
    {
      title: "Get Cafe24 Main Product Settings",
      description:
        "Retrieve main product display settings including strikethrough options and text styles for tax, discount, and optimum discount prices.",
      inputSchema: MainSettingParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_main_setting,
  );

  server.registerTool(
    "cafe24_update_main_setting",
    {
      title: "Update Cafe24 Main Product Settings",
      description:
        "Update main product display settings. Configure strikethrough for retail/price, and customize styles (color, size, font type) for tax, discount, and optimum discount texts.",
      inputSchema: MainSettingUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_main_setting,
  );

  server.registerTool(
    "cafe24_list_mains",
    {
      title: "List Main Display Groups",
      description: "Retrieve a list of all main display groups",
      inputSchema: ListMainsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_mains,
  );

  server.registerTool(
    "cafe24_create_main",
    {
      title: "Create Main Display Group",
      description: "Create a new main display group",
      inputSchema: CreateMainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_create_main,
  );

  server.registerTool(
    "cafe24_update_main",
    {
      title: "Update Main Display Group",
      description: "Update an existing main display group",
      inputSchema: UpdateMainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_main,
  );

  server.registerTool(
    "cafe24_delete_main",
    {
      title: "Delete Main Display Group",
      description: "Delete an existing main display group",
      inputSchema: DeleteMainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_delete_main,
  );
}
