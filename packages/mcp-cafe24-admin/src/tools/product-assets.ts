import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import {
  DecorationImagesListParamsSchema,
  IconsListParamsSchema,
  ProductImagesUploadParamsSchema,
} from "../schemas/product-assets.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

interface DecorationImage {
  code: string;
  path: string;
}

interface Icon {
  code: string;
  path: string;
}

interface UploadedImage {
  path: string;
}

interface DecorationImagesListResponse {
  decorationimages: DecorationImage[];
}

interface IconsListResponse {
  icons: Icon[];
}

interface ImagesUploadResponse {
  images: UploadedImage[];
}

async function cafe24_list_decoration_images(
  _params: z.infer<typeof DecorationImagesListParamsSchema>,
) {
  try {
    const data = await makeApiRequest<DecorationImagesListResponse>(
      "/admin/products/decorationimages",
      "GET",
    );

    const images = data.decorationimages || [];

    const content =
      images.length > 0
        ? `**Decoration Images (${images.length}):**\n\n` +
          images.map((img) => `- **${img.code}**: ${img.path}`).join("\n")
        : "No decoration images found.";

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { decorationimages: images } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_list_icons(_params: z.infer<typeof IconsListParamsSchema>) {
  try {
    const data = await makeApiRequest<IconsListResponse>("/admin/products/icons", "GET");

    const icons = data.icons || [];

    const content =
      icons.length > 0
        ? `**Product Icons (${icons.length}):**\n\n` +
          icons.map((icon) => `- **${icon.code}**: ${icon.path}`).join("\n")
        : "No icons found.";

    return {
      content: [{ type: "text" as const, text: content }],
      structuredContent: { icons } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_upload_product_images(
  params: z.infer<typeof ProductImagesUploadParamsSchema>,
) {
  try {
    const { requests } = params;

    const payload = { requests };

    const data = await makeApiRequest<ImagesUploadResponse>(
      "/admin/products/images",
      "POST",
      payload,
    );

    const images = data.images || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Uploaded ${images.length} image(s):\n\n` +
            images.map((img, i) => `${i + 1}. ${img.path}`).join("\n"),
        },
      ],
      structuredContent: { images } as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_decoration_images",
    {
      title: "List Decoration Images",
      description:
        "Retrieve all available decoration images that can be applied to products. Returns code and path for each decoration image.",
      inputSchema: DecorationImagesListParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_decoration_images,
  );

  server.registerTool(
    "cafe24_list_icons",
    {
      title: "List Product Icons",
      description: "Retrieve all available product icons. Returns code and path for each icon.",
      inputSchema: IconsListParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_icons,
  );

  server.registerTool(
    "cafe24_upload_product_images",
    {
      title: "Upload Product Images",
      description:
        "Upload product images using base64 encoded data. Max 10MB per file, 30MB total per request. Returns URLs of uploaded images.",
      inputSchema: ProductImagesUploadParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_upload_product_images,
  );
}
