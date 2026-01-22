import { z } from "zod";

export const MainPropertySchema = z.object({
  key: z.string().describe("Property key (e.g., product_name)"),
  name: z.string().optional().describe("Property name text"),
  display: z.enum(["T", "F"]).optional().describe("Display property"),
  display_name: z.enum(["T", "F"]).optional().describe("Display property name"),
  font_type: z
    .enum(["N", "B", "I", "D"])
    .optional()
    .describe("Font type (N: Normal, B: Bold, I: Italic, D: Bold Italic)"),
  font_size: z.number().int().optional().describe("Font size"),
  font_color: z.string().optional().describe("Font color"),
});

export const ListMainPropertiesSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    display_group: z.number().int().min(2).optional().default(2).describe("Display group number"),
  })
  .strict();

export const CreateMainPropertySchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    multishop_display_names: z
      .array(
        z.object({
          shop_no: z.number().int(),
          name: z.string(),
        }),
      )
      .min(1)
      .describe("Display names for multiple shops"),
    display: z.enum(["T", "F"]).optional().default("F").describe("Display property"),
    display_name: z.enum(["T", "F"]).optional().default("T").describe("Display property name"),
    font_type: z
      .enum(["N", "B", "I", "D"])
      .optional()
      .default("N")
      .describe("Font type (N: Normal, B: Bold, I: Italic, D: Bold Italic)"),
    font_size: z.number().int().optional().default(12).describe("Font size"),
    font_color: z.string().optional().default("#555555").describe("Font color"),
    exposure_group_type: z
      .enum(["A", "M"])
      .optional()
      .default("A")
      .describe("Exposure group type (A: All, M: Member)"),
  })
  .strict();

export const UpdateMainPropertiesSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    display_group: z.number().int().min(2).describe("Display group number"),
    properties: z.array(MainPropertySchema).describe("List of properties to update"),
  })
  .strict();

export const MainSettingParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

export const TextStyleSchema = z
  .object({
    use: z.enum(["T", "F"]).optional().describe("Use: T=Yes, F=No"),
    color: z.string().optional().describe("Font color (e.g., #000000)"),
    font_size: z.union([z.number(), z.string()]).optional().describe("Font size (in pixels)"),
    font_type: z
      .enum(["N", "B", "I", "D"])
      .optional()
      .describe("Font type: N=Normal, B=Bold, I=Italic, D=Bold Italic"),
  })
  .strict();

export const MainSettingUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    strikethrough_retail_price: z
      .enum(["T", "F"])
      .optional()
      .describe("Strikethrough retail price: T=Yes, F=No"),
    strikethrough_price: z.enum(["T", "F"]).optional().describe("Strikethrough price: T=Yes, F=No"),
    product_tax_type_text: TextStyleSchema.optional().describe("Tax type display settings"),
    product_discount_price_text: TextStyleSchema.optional().describe(
      "Discount price display settings",
    ),
    optimum_discount_price_text: TextStyleSchema.optional().describe(
      "Optimum discount price display settings",
    ),
  })
  .strict();

export const ListMainsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
  })
  .strict();

export const CreateMainSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    group_name: z.string().max(50).describe("Group Name"),
    soldout_sort_type: z
      .enum(["B", "N"])
      .optional()
      .default("N")
      .describe("Sold-out product display status (B: Move to back, N: Normal)"),
  })
  .strict();

export const UpdateMainSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    display_group: z.number().int().describe("Main category number"),
    group_name: z.string().max(50).optional().describe("Group Name"),
    soldout_sort_type: z
      .enum(["B", "N"])
      .optional()
      .describe("Sold-out product display status (B: Move to back, N: Normal)"),
  })
  .strict();

export const DeleteMainSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    display_group: z.number().int().describe("Main category number"),
  })
  .strict();

export type MainProperty = z.infer<typeof MainPropertySchema>;
export type ListMainProperties = z.infer<typeof ListMainPropertiesSchema>;
export type CreateMainProperty = z.infer<typeof CreateMainPropertySchema>;
export type UpdateMainProperties = z.infer<typeof UpdateMainPropertiesSchema>;
export type MainSettingParams = z.infer<typeof MainSettingParamsSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type MainSettingUpdateParams = z.infer<typeof MainSettingUpdateParamsSchema>;
export type ListMains = z.infer<typeof ListMainsSchema>;
export type CreateMain = z.infer<typeof CreateMainSchema>;
export type UpdateMain = z.infer<typeof UpdateMainSchema>;
export type DeleteMain = z.infer<typeof DeleteMainSchema>;
