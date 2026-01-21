import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type BulkCreateShipmentInput,
  BulkCreateShipmentInputSchema,
  type BulkUpdateShipmentInput,
  BulkUpdateShipmentInputSchema,
  type CreateShipmentParams,
  CreateShipmentParamsSchema,
  type DeleteShipmentParams,
  DeleteShipmentParamsSchema,
  type ListShipmentsParams,
  ListShipmentsParamsSchema,
  type UpdateShipmentParams,
  UpdateShipmentParamsSchema,
} from "../schemas/shipment.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";
import type {
  BulkCreateShipmentResponse,
  BulkUpdateShipmentResponse,
  CreateShipmentResponse,
  DeleteShipmentResponse,
  ListShipmentsResponse,
  UpdateShipmentResponse,
} from "../types/shipment.js";

async function cafe24_list_shipments(params: ListShipmentsParams) {
  try {
    const { order_id, shop_no } = params;
    const data = (await makeApiRequest<ListShipmentsResponse>(
      `/admin/orders/${order_id}/shipments`,
      "GET",
      undefined,
      { shop_no },
    )) as unknown as Record<string, unknown>;

    const shipments = (data.shipments as any[]) || [];

    return {
      content: [
        {
          type: "text" as const,
          text: `# Shipments for Order ${order_id}\n\n${shipments
            .map(
              (s: any) =>
                `## Shipment ${s.shipping_code}\n` +
                `- Status: ${s.status}\n` +
                `- Tracking No: ${s.tracking_no || "N/A"}\n` +
                `- Shipping Company: ${s.shipping_company_code || "N/A"}\n` +
                `- Items: ${s.items?.map((i: any) => i.order_item_code).join(", ")}\n`,
            )
            .join("\n")}`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_create_shipment(params: CreateShipmentParams) {
  try {
    const { order_id, shop_no, request } = params;
    const data = (await makeApiRequest<CreateShipmentResponse>(
      `/admin/orders/${order_id}/shipments`,
      "POST",
      {
        shop_no,
        request,
      },
    )) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created shipment(s) for Order ${order_id}.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_update_shipment(params: UpdateShipmentParams) {
  try {
    const { order_id, shipping_code, shop_no, request } = params;
    const data = (await makeApiRequest<UpdateShipmentResponse>(
      `/admin/orders/${order_id}/shipments/${shipping_code}`,
      "PUT",
      {
        shop_no,
        request,
      },
    )) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated shipment ${shipping_code} for Order ${order_id}.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_delete_shipment(params: DeleteShipmentParams) {
  try {
    const { order_id, shipping_code, shop_no } = params;
    const data = (await makeApiRequest<DeleteShipmentResponse>(
      `/admin/orders/${order_id}/shipments/${shipping_code}`,
      "DELETE",
      undefined,
      { shop_no },
    )) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully deleted shipment ${shipping_code} for Order ${order_id}.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_bulk_create_shipments(params: BulkCreateShipmentInput) {
  try {
    const { shop_no, requests } = params;
    const data = (await makeApiRequest<BulkCreateShipmentResponse>("/admin/shipments", "POST", {
      shop_no,
      requests,
    })) as unknown as Record<string, unknown>;

    const shipments = (data.shipments as any[]) || [];

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created ${shipments.length} shipment(s).`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_bulk_update_shipments(params: BulkUpdateShipmentInput) {
  try {
    const { shop_no, requests } = params;
    const data = (await makeApiRequest<BulkUpdateShipmentResponse>("/admin/shipments", "PUT", {
      shop_no,
      requests,
    })) as unknown as Record<string, unknown>;

    const shipments = (data.shipments as any[]) || [];

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated ${shipments.length} shipment(s).`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_shipments",
    {
      title: "List Cafe24 Order Shipments",
      description: "Retrieve a list of shipments for a specific order.",
      inputSchema: ListShipmentsParamsSchema,
    },
    cafe24_list_shipments,
  );

  server.registerTool(
    "cafe24_create_shipment",
    {
      title: "Create Cafe24 Order Shipment",
      description: "Create a new shipment (tracking number) for an order.",
      inputSchema: CreateShipmentParamsSchema,
    },
    cafe24_create_shipment,
  );

  server.registerTool(
    "cafe24_update_shipment",
    {
      title: "Update Cafe24 Order Shipment",
      description: "Update shipping status or tracking information for a shipment.",
      inputSchema: UpdateShipmentParamsSchema,
    },
    cafe24_update_shipment,
  );

  server.registerTool(
    "cafe24_delete_shipment",
    {
      title: "Delete Cafe24 Order Shipment",
      description: "Delete a shipment from an order.",
      inputSchema: DeleteShipmentParamsSchema,
    },
    cafe24_delete_shipment,
  );

  server.registerTool(
    "cafe24_bulk_create_shipments",
    {
      title: "Bulk Create Cafe24 Shipments",
      description: "Create multiple shipments across different orders in a single request.",
      inputSchema: BulkCreateShipmentInputSchema,
    },
    cafe24_bulk_create_shipments,
  );

  server.registerTool(
    "cafe24_bulk_update_shipments",
    {
      title: "Bulk Update Cafe24 Shipments",
      description: "Update multiple shipments across different orders in a single request.",
      inputSchema: BulkUpdateShipmentInputSchema,
    },
    cafe24_bulk_update_shipments,
  );
}
