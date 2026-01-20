import { z } from "zod";

export const ProductPropertiesParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

export const TextStyleSchema = z.object({
  use: z.enum(["T", "F"]).optional().describe("Use text style: T=Yes, F=No"),
  color: z.string().optional().describe("Text color (Hex code, e.g. #999999)"),
  font_size: z.union([z.string(), z.number()]).optional().describe("Font size (e.g. 12 or '12')"),
  font_type: z
    .enum(["N", "B", "I", "D"])
    .optional()
    .describe("Font type: N=Normal, B=Bold, I=Italic, D=Bold Italic"),
});

export const ProductPropertiesUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    strikethrough_retail_price: z
      .enum(["T", "F"])
      .optional()
      .describe("Strikethrough retail price: T=Yes, F=No"),
    strikethrough_price: z
      .enum(["T", "F"])
      .optional()
      .describe("Strikethrough selling price: T=Yes, F=No"),
    product_tax_type_text: TextStyleSchema.optional().describe("Tax amount display text style"),
    product_discount_price_text: TextStyleSchema.optional().describe(
      "Discount price display text style",
    ),
    optimum_discount_price_text: TextStyleSchema.optional().describe(
      "Optimum discount price display text style",
    ),
  })
  .strict();

export type ProductPropertiesParams = z.infer<typeof ProductPropertiesParamsSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type ProductPropertiesUpdateParams = z.infer<typeof ProductPropertiesUpdateParamsSchema>;

/**
 * Schema for listing product field properties
 */
export const ProductFieldPropertiesParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Shop number (default: 1)"),
  })
  .strict();

export type ProductFieldPropertiesParams = z.infer<typeof ProductFieldPropertiesParamsSchema>;
