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

/**
 * Schema for multishop display name
 */
const MultishopDisplayNameSchema = z.object({
  shop_no: z.number().int().min(1).describe("Shop number"),
  name: z.string().describe("Display name for this shop"),
});

/**
 * Schema for creating a product field property
 */
export const ProductFieldPropertyCreateParamsSchema = z
  .object({
    multishop_display_names: z
      .array(MultishopDisplayNameSchema)
      .min(1)
      .describe("Display names for each shop"),
    display: z
      .enum(["T", "F"])
      .optional()
      .default("F")
      .describe("Whether to display the field (T: Display, F: Do not display)"),
    display_name: z
      .enum(["T", "F"])
      .optional()
      .default("T")
      .describe("Display field name (T: Used, F: Not used)"),
    font_type: z
      .enum(["N", "B", "I", "D"])
      .optional()
      .default("N")
      .describe("Font type (N: Normal, B: Bold, I: Italic, D: Bold Italic)"),
    font_size: z.number().int().optional().default(12).describe("Font size"),
    font_color: z.string().optional().default("#555555").describe("Font color (Hex code)"),
    exposure_group_type: z
      .enum(["A", "M"])
      .optional()
      .default("A")
      .describe("Display target (A: All, M: Customer accounts)"),
  })
  .strict();

export type ProductFieldPropertyCreateParams = z.infer<
  typeof ProductFieldPropertyCreateParamsSchema
>;

/**
 * Schema for a single property in bulk update
 */
const FieldPropertyItemSchema = z.object({
  key: z.string().describe("Field code (required)"),
  name: z.string().optional().describe("Field name (text)"),
  display: z.enum(["T", "F"]).optional().describe("Whether to display the field"),
  font_type: z
    .enum(["N", "B", "I", "D"])
    .optional()
    .describe("Font type (N: Normal, B: Bold, I: Italic, D: Bold Italic)"),
  font_size: z.number().int().optional().describe("Font size"),
  font_color: z.string().optional().describe("Font color (Hex code)"),
});

/**
 * Schema for updating product field properties
 */
export const ProductFieldPropertiesUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Shop number (default: 1)"),
    properties: z.array(FieldPropertyItemSchema).min(1).describe("Array of properties to update"),
  })
  .strict();

export type ProductFieldPropertiesUpdateParams = z.infer<
  typeof ProductFieldPropertiesUpdateParamsSchema
>;
