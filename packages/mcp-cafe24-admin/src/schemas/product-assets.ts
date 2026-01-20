import { z } from "zod";

/**
 * Schema for listing decoration images (no parameters needed)
 */
export const DecorationImagesListParamsSchema = z.object({}).strict();

export type DecorationImagesListParams = z.infer<typeof DecorationImagesListParamsSchema>;

/**
 * Schema for listing icons (no parameters needed)
 */
export const IconsListParamsSchema = z.object({}).strict();

export type IconsListParams = z.infer<typeof IconsListParamsSchema>;

/**
 * Schema for a single image upload request
 */
const ImageUploadItemSchema = z.object({
  image: z.string().describe("Base64 encoded image data (max 10MB per file)"),
});

/**
 * Schema for uploading product images
 */
export const ProductImagesUploadParamsSchema = z
  .object({
    requests: z
      .array(ImageUploadItemSchema)
      .min(1)
      .describe("Array of images to upload (max 30MB total per request)"),
  })
  .strict();

export type ProductImagesUploadParams = z.infer<typeof ProductImagesUploadParamsSchema>;
