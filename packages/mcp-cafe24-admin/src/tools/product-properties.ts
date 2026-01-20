import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type ProductFieldPropertiesParams,
  ProductFieldPropertiesParamsSchema,
  type ProductFieldPropertiesUpdateParams,
  ProductFieldPropertiesUpdateParamsSchema,
  type ProductFieldPropertyCreateParams,
  ProductFieldPropertyCreateParamsSchema,
  type ProductPropertiesParams,
  ProductPropertiesParamsSchema,
  type ProductPropertiesUpdateParams,
  ProductPropertiesUpdateParamsSchema,
  type TextStyle,
} from "@/schemas/product-properties.js";
import type { DisplaySetting } from "@/types/index.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

async function cafe24_get_product_properties_setting(params: ProductPropertiesParams) {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest<{ product: DisplaySetting } | DisplaySetting>(
      "/admin/products/properties/setting",
      "GET",
      undefined,
      queryParams,
    );
    const product = (data as any).product || data;

    const formatTextStyle = (style?: TextStyle) => {
      if (!style) return "N/A";
      return `Use: ${style.use}, Color: ${style.color}, Size: ${style.font_size}, Type: ${style.font_type}`;
    };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Product Properties Settings (Shop #${product.shop_no || 1})\n\n` +
            `- **Strikethrough Retail Price**: ${product.strikethrough_retail_price === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Strikethrough Selling Price**: ${product.strikethrough_price === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Tax Text Style**: ${formatTextStyle(product.product_tax_type_text)}\n` +
            `- **Discount Text Style**: ${formatTextStyle(product.product_discount_price_text)}\n` +
            `- **Optimum Discount Text Style**: ${formatTextStyle(product.optimum_discount_price_text)}\n`,
        },
      ],
      structuredContent: {
        shop_no: product.shop_no ?? 1,
        strikethrough_retail_price: product.strikethrough_retail_price,
        strikethrough_price: product.strikethrough_price,
        product_tax_type_text: product.product_tax_type_text,
        product_discount_price_text: product.product_discount_price_text,
        optimum_discount_price_text: product.optimum_discount_price_text,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_properties_setting(params: ProductPropertiesUpdateParams) {
  try {
    const { shop_no, ...settings } = params;

    const requestBody: Record<string, unknown> = {
      shop_no: shop_no ?? 1,
      request: settings,
    };

    const data = await makeApiRequest<{ product: DisplaySetting } | DisplaySetting>(
      "/admin/products/properties/setting",
      "PUT",
      requestBody,
    );
    const product = (data as any).product || data;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Product Properties Settings Updated (Shop #${product.shop_no || 1})\n\n` +
            `- **Strikethrough Retail Price**: ${product.strikethrough_retail_price === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Strikethrough Selling Price**: ${product.strikethrough_price === "T" ? "Enabled" : "Disabled"}\n`,
        },
      ],
      structuredContent: {
        shop_no: (product as DisplaySetting).shop_no ?? 1,
        strikethrough_retail_price: (product as DisplaySetting).strikethrough_retail_price,
        strikethrough_price: (product as DisplaySetting).strikethrough_price,
        product_tax_type_text: (product as DisplaySetting).product_tax_type_text,
        product_discount_price_text: (product as DisplaySetting).product_discount_price_text,
        optimum_discount_price_text: (product as DisplaySetting).optimum_discount_price_text,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

interface FieldProperty {
  key: string;
  name: string;
  display: string;
  font_type: string;
  font_size: number;
  font_color: string;
}

interface ProductFieldPropertiesResponse {
  product: {
    shop_no: number;
    properties: FieldProperty[];
  };
}

async function cafe24_list_product_field_properties(params: ProductFieldPropertiesParams) {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest<ProductFieldPropertiesResponse>(
      "/admin/products/properties",
      "GET",
      undefined,
      queryParams,
    );

    const product = data.product;
    const properties = product?.properties || [];

    let content = `**Product Field Properties (Shop #${product?.shop_no || 1}):**\n\n`;
    content += `| Key | Name | Display | Font Type | Size | Color |\n`;
    content += `|-----|------|---------|-----------|------|-------|\n`;
    for (const prop of properties) {
      content += `| ${prop.key} | ${prop.name} | ${prop.display === "T" ? "Yes" : "No"} | ${prop.font_type} | ${prop.font_size} | ${prop.font_color} |\n`;
    }

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { product } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

interface CreatedPropertyResponse {
  product: {
    property: {
      key: string;
      multishop_display_names: Array<{ shop_no: number; name: string }>;
      display: string;
      display_name: string;
      font_type: string;
      font_size: number;
      font_color: string;
      exposure_group_type: string;
    };
  };
}

async function cafe24_create_product_field_property(params: ProductFieldPropertyCreateParams) {
  try {
    const payload = {
      request: {
        property: params,
      },
    };

    const data = await makeApiRequest<CreatedPropertyResponse>(
      "/admin/products/properties",
      "POST",
      payload,
    );

    const property = data.product?.property;

    const shopNames =
      property?.multishop_display_names?.map((s) => `Shop #${s.shop_no}: ${s.name}`).join(", ") ||
      "N/A";

    const content =
      `**Created Product Field Property**\n\n` +
      `- **Key**: ${property?.key}\n` +
      `- **Display Names**: ${shopNames}\n` +
      `- **Display**: ${property?.display === "T" ? "Yes" : "No"}\n` +
      `- **Display Name**: ${property?.display_name === "T" ? "Yes" : "No"}\n` +
      `- **Font**: ${property?.font_type} / ${property?.font_size}px / ${property?.font_color}\n` +
      `- **Exposure Group**: ${property?.exposure_group_type === "A" ? "All" : "Customer accounts"}`;

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { product: data.product } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_field_properties(params: ProductFieldPropertiesUpdateParams) {
  try {
    const { shop_no, properties } = params;

    const payload = {
      shop_no: shop_no ?? 1,
      request: { properties },
    };

    const data = await makeApiRequest<ProductFieldPropertiesResponse>(
      "/admin/products/properties",
      "PUT",
      payload,
    );

    const product = data.product;
    const updatedProperties = product?.properties || [];

    let content = `**Updated Product Field Properties (Shop #${product?.shop_no || 1}):**\n\n`;
    content += `| Key | Name | Display | Font Type | Size | Color |\n`;
    content += `|-----|------|---------|-----------|------|-------|\n`;
    for (const prop of updatedProperties) {
      content += `| ${prop.key} | ${prop.name} | ${prop.display === "T" ? "Yes" : "No"} | ${prop.font_type} | ${prop.font_size} | ${prop.font_color} |\n`;
    }

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { product } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_product_properties_setting",
    {
      title: "Get Cafe24 Product Properties Settings",
      description:
        "Retrieve product display property settings, including strikethrough prices and text styles for tax and discount amounts.",
      inputSchema: ProductPropertiesParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_product_properties_setting,
  );

  server.registerTool(
    "cafe24_update_product_properties_setting",
    {
      title: "Update Cafe24 Product Properties Settings",
      description:
        "Update product display property settings. Configure strikethrough options for retail/selling prices and customize text styles (color, size, font type) for tax, discount, and optimum discount amounts.",
      inputSchema: ProductPropertiesUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_properties_setting,
  );

  server.registerTool(
    "cafe24_list_product_field_properties",
    {
      title: "List Product Field Properties",
      description:
        "Retrieve product field display properties including field key, name, display status, font type, size, and color settings.",
      inputSchema: ProductFieldPropertiesParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_product_field_properties,
  );

  server.registerTool(
    "cafe24_create_product_field_property",
    {
      title: "Create Product Field Property",
      description:
        "Create a new custom product field property with multishop display names, font settings, and exposure options.",
      inputSchema: ProductFieldPropertyCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_product_field_property,
  );

  server.registerTool(
    "cafe24_update_product_field_properties",
    {
      title: "Update Product Field Properties",
      description:
        "Update multiple product field properties including name, display status, and font settings.",
      inputSchema: ProductFieldPropertiesUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_field_properties,
  );
}
