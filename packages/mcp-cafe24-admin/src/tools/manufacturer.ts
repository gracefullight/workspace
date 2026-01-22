import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CountManufacturers,
  CountManufacturersSchema,
  type CreateManufacturer,
  CreateManufacturerSchema,
  type ListManufacturers,
  ListManufacturersSchema,
  type RetrieveManufacturer,
  RetrieveManufacturerSchema,
  type UpdateManufacturer,
  UpdateManufacturerSchema,
} from "@/schemas/manufacturer.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type {
  ListManufacturersResponse,
  ManufacturerCountResponse,
  ManufacturerResponse,
} from "@/types/index.js";

async function cafe24_list_manufacturers(params: ListManufacturers) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ListManufacturersResponse>(
      "/admin/manufacturers",
      "GET",
      undefined,
      queryParams as Record<string, unknown>,
      requestHeaders,
    );

    const manufacturers = data.manufacturers || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${manufacturers.length} manufacturers.\n\n` +
            manufacturers
              .map(
                (m) =>
                  `- [${m.manufacturer_code}] ${m.manufacturer_name} (${m.president_name})\n  Used: ${m.use_manufacturer === "T" ? "Yes" : "No"}`,
              )
              .join("\n"),
        },
      ],
      structuredContent: { manufacturers },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_retrieve_manufacturer(params: RetrieveManufacturer) {
  try {
    const { shop_no, manufacturer_code } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ManufacturerResponse>(
      `/admin/manufacturers/${manufacturer_code}`,
      "GET",
      undefined,
      undefined,
      requestHeaders,
    );

    const manufacturer = data.manufacturer;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Manufacturer Detail: ${manufacturer.manufacturer_name} (${manufacturer.manufacturer_code})\n` +
            `- CEO: ${manufacturer.president_name}\n` +
            `- Email: ${manufacturer.email || "N/A"}\n` +
            `- Phone: ${manufacturer.phone || "N/A"}\n` +
            `- Homepage: ${manufacturer.homepage || "N/A"}\n` +
            `- Address: ${manufacturer.address1 || ""} ${manufacturer.address2 || ""}\n` +
            `- Used: ${manufacturer.use_manufacturer === "T" ? "Yes" : "No"}`,
        },
      ],
      structuredContent: manufacturer,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_count_manufacturers(params: CountManufacturers) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ManufacturerCountResponse>(
      "/admin/manufacturers/count",
      "GET",
      undefined,
      queryParams as Record<string, unknown>,
      requestHeaders,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Total manufacturer count: ${data.count}`,
        },
      ],
      structuredContent: { count: data.count },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_manufacturer(params: CreateManufacturer) {
  try {
    const { shop_no, request } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ManufacturerResponse>(
      "/admin/manufacturers",
      "POST",
      { shop_no, request },
      undefined,
      requestHeaders,
    );

    const manufacturer = data.manufacturer;

    return {
      content: [
        {
          type: "text" as const,
          text: `Created manufacturer: ${manufacturer.manufacturer_name} (Code: ${manufacturer.manufacturer_code})`,
        },
      ],
      structuredContent: manufacturer,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_manufacturer(params: UpdateManufacturer) {
  try {
    const { shop_no, manufacturer_code, request } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<ManufacturerResponse>(
      `/admin/manufacturers/${manufacturer_code}`,
      "PUT",
      { shop_no, request },
      undefined,
      requestHeaders,
    );

    const manufacturer = data.manufacturer;

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated manufacturer: ${manufacturer.manufacturer_name} (Code: ${manufacturer.manufacturer_code})`,
        },
      ],
      structuredContent: manufacturer,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_manufacturers",
    {
      title: "List Manufacturers",
      description: "Retrieve a list of manufacturers",
      inputSchema: ListManufacturersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_manufacturers,
  );

  server.registerTool(
    "cafe24_retrieve_manufacturer",
    {
      title: "Retrieve Manufacturer",
      description: "Retrieve details of a single manufacturer",
      inputSchema: RetrieveManufacturerSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_retrieve_manufacturer,
  );

  server.registerTool(
    "cafe24_count_manufacturers",
    {
      title: "Count Manufacturers",
      description: "Retrieve the count of manufacturers",
      inputSchema: CountManufacturersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_manufacturers,
  );

  server.registerTool(
    "cafe24_create_manufacturer",
    {
      title: "Create Manufacturer",
      description: "Create a new manufacturer",
      inputSchema: CreateManufacturerSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_create_manufacturer,
  );

  server.registerTool(
    "cafe24_update_manufacturer",
    {
      title: "Update Manufacturer",
      description: "Update an existing manufacturer",
      inputSchema: UpdateManufacturerSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_update_manufacturer,
  );
}
