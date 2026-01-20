import { z } from "zod";

/**
 * Schema for listing product memos
 */
export const ProductMemosListParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
    offset: z
      .number()
      .int()
      .min(0)
      .max(8000)
      .default(0)
      .describe("Number of results to skip (max 8000)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum results to return (1-100)"),
  })
  .strict();

export type ProductMemosListParams = z.infer<typeof ProductMemosListParamsSchema>;

/**
 * Schema for getting a single product memo
 */
export const ProductMemoGetParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
    memo_no: z.number().describe("Memo number (required)"),
  })
  .strict();

export type ProductMemoGetParams = z.infer<typeof ProductMemoGetParamsSchema>;

/**
 * Schema for creating a product memo
 */
export const ProductMemoCreateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
    author_id: z.string().max(20).describe("Author ID (required, max 20 characters)"),
    memo: z.string().describe("Memo content (required, HTML supported)"),
  })
  .strict();

export type ProductMemoCreateParams = z.infer<typeof ProductMemoCreateParamsSchema>;

/**
 * Schema for updating a product memo
 */
export const ProductMemoUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
    memo_no: z.number().describe("Memo number (required)"),
    author_id: z.string().max(20).describe("Author ID (required, max 20 characters)"),
    memo: z.string().describe("Memo content (required, HTML supported)"),
  })
  .strict();

export type ProductMemoUpdateParams = z.infer<typeof ProductMemoUpdateParamsSchema>;

/**
 * Schema for deleting a product memo
 */
export const ProductMemoDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
    memo_no: z.number().describe("Memo number (required)"),
  })
  .strict();

export type ProductMemoDeleteParams = z.infer<typeof ProductMemoDeleteParamsSchema>;
