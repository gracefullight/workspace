import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type GetShippingSupplier,
  GetShippingSupplierSchema,
  type UpdateShippingSupplier,
  UpdateShippingSupplierSchema,
} from "@/schemas/shipping-supplier.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type { ShippingSupplierResponse } from "@/types/index.js";

async function cafe24_get_shipping_supplier(params: GetShippingSupplier) {
  try {
    const { shop_no, supplier_id } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ShippingSupplierResponse>(
      `/admin/shipping/suppliers/${supplier_id}`,
      "GET",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const supplier = data.supplier;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Shipping Supplier: ${supplier.supplier_id} (${supplier.supplier_code})\n\n` +
            `- **Method**: ${supplier.shipping_method}\n` +
            `- **Type**: ${supplier.shipping_type === "A" ? "Domestic" : supplier.shipping_type === "C" ? "International" : "Both"}\n` +
            `- **Fee Type**: ${supplier.shipping_fee_type}\n` +
            `- **Prepaid**: ${supplier.prepaid_shipping_fee}\n` +
            `- **Place**: ${supplier.shipping_place ?? "N/A"}\n` +
            `- **Weight**: ${supplier.product_weight ?? "N/A"}\n`,
        },
      ],
      structuredContent: supplier,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_shipping_supplier(params: UpdateShippingSupplier) {
  try {
    const { shop_no, supplier_id, request } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ShippingSupplierResponse>(
      `/admin/shipping/suppliers/${supplier_id}`,
      "PUT",
      { shop_no, request },
      undefined,
      requestHeaders,
    );

    const supplier = data.supplier;

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated shipping settings for supplier: ${supplier.supplier_id}`,
        },
      ],
      structuredContent: supplier,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_shipping_supplier",
    {
      title: "Get Shipping Supplier Settings",
      description: "Retrieve shipping settings for a specific supplier",
      inputSchema: GetShippingSupplierSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_shipping_supplier,
  );

  server.registerTool(
    "cafe24_update_shipping_supplier",
    {
      title: "Update Shipping Supplier Settings",
      description: "Update shipping settings for a specific supplier",
      inputSchema: UpdateShippingSupplierSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_shipping_supplier,
  );
}
