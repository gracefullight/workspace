import { z } from "zod";

export const CategoriesSearchParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    category_depth: z.number().int().min(1).max(4).optional().describe("Category depth (1-4)"),
    category_no: z
      .string()
      .optional()
      .describe("Category number(s), comma-separated (e.g., 27,28)"),
    parent_category_no: z.number().int().optional().describe("Parent category number"),
    category_name: z.string().optional().describe("Category name contains"),
    use_main: z.enum(["T", "F"]).optional().describe("Main classification display status"),
    use_display: z.enum(["T", "F"]).optional().describe("Display status"),
    offset: z.number().int().min(0).max(8000).default(0).describe("Start location of list"),
    limit: z.number().int().min(1).max(100).default(10).describe("Limit"),
  })
  .strict();

export type CategoriesSearchParams = z.infer<typeof CategoriesSearchParamsSchema>;

export const CategoriesCountParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    category_depth: z.number().int().min(1).max(4).optional().describe("Category depth (1-4)"),
    category_no: z
      .string()
      .optional()
      .describe("Category number(s), comma-separated (e.g., 27,28)"),
    parent_category_no: z.number().int().optional().describe("Parent category number"),
    category_name: z.string().optional().describe("Category name contains"),
    use_main: z.enum(["T", "F"]).optional().describe("Main classification display status"),
    use_display: z.enum(["T", "F"]).optional().describe("Display status"),
  })
  .strict();

export type CategoriesCountParams = z.infer<typeof CategoriesCountParamsSchema>;

export const CategoryDetailParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    category_no: z.number().int().min(1).describe("Category number"),
  })
  .strict();

export type CategoryDetailParams = z.infer<typeof CategoryDetailParamsSchema>;

const CategoryCreateRequestSchema = z
  .object({
    parent_category_no: z.number().int().optional().describe("Parent category number"),
    category_name: z.string().min(1).max(50).describe("Category name"),
    display_type: z.enum(["A", "P", "M", "F"]).optional().describe("Display setting"),
    use_display: z.enum(["T", "F"]).optional().describe("Display status"),
    use_main: z.enum(["T", "F"]).optional().describe("Main classification display status"),
    soldout_product_display: z.enum(["B", "N"]).optional().describe("Sold-out product display"),
    sub_category_product_display: z
      .enum(["T", "F"])
      .optional()
      .describe("Sub-category product display"),
    hashtag_product_display: z
      .enum(["T", "F"])
      .optional()
      .describe("Hashtag-based product display"),
    hash_tags: z.array(z.string()).optional().describe("Hashtags"),
    product_display_scope: z.enum(["A", "G"]).optional().describe("Category display scope"),
    product_display_type: z.enum(["A", "U", "M"]).optional().describe("Category display method"),
    product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Category display key"),
    product_display_sort: z.enum(["D", "A"]).optional().describe("Category display order"),
    product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Category display period"),
    normal_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("Normal product display method"),
    normal_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Normal product display key"),
    normal_product_display_sort: z
      .enum(["D", "A"])
      .optional()
      .describe("Normal product display order"),
    normal_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Normal product display period"),
    recommend_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("Recommend product display method"),
    recommend_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Recommend product display key"),
    recommend_product_display_sort: z
      .enum(["D", "A"])
      .optional()
      .describe("Recommend product display order"),
    recommend_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Recommend product display period"),
    new_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("New product display method"),
    new_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("New product display key"),
    new_product_display_sort: z.enum(["D", "A"]).optional().describe("New product display order"),
    new_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("New product display period"),
  })
  .strict();

export const CategoryCreateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    request: CategoryCreateRequestSchema.describe("Category creation payload"),
  })
  .strict();

export type CategoryCreateParams = z.infer<typeof CategoryCreateParamsSchema>;

const CategoryUpdateRequestSchema = z
  .object({
    category_name: z.string().min(1).max(50).optional().describe("Category name"),
    display_type: z.enum(["A", "P", "M", "F"]).optional().describe("Display setting"),
    use_display: z.enum(["T", "F"]).optional().describe("Display status"),
    use_main: z.enum(["T", "F"]).optional().describe("Main classification display status"),
    soldout_product_display: z.enum(["B", "N"]).optional().describe("Sold-out product display"),
    sub_category_product_display: z
      .enum(["T", "F"])
      .optional()
      .describe("Sub-category product display"),
    hashtag_product_display: z
      .enum(["T", "F"])
      .optional()
      .describe("Hashtag-based product display"),
    hash_tags: z.array(z.string()).optional().describe("Hashtags"),
    product_display_scope: z.enum(["A", "G"]).optional().describe("Category display scope"),
    product_display_type: z.enum(["A", "U", "M"]).optional().describe("Category display method"),
    product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Category display key"),
    product_display_sort: z.enum(["D", "A"]).optional().describe("Category display order"),
    product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Category display period"),
    normal_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("Normal product display method"),
    normal_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Normal product display key"),
    normal_product_display_sort: z
      .enum(["D", "A"])
      .optional()
      .describe("Normal product display order"),
    normal_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Normal product display period"),
    recommend_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("Recommend product display method"),
    recommend_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("Recommend product display key"),
    recommend_product_display_sort: z
      .enum(["D", "A"])
      .optional()
      .describe("Recommend product display order"),
    recommend_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("Recommend product display period"),
    new_product_display_type: z
      .enum(["A", "U", "M"])
      .optional()
      .describe("New product display method"),
    new_product_display_key: z
      .enum(["A", "R", "U", "N", "P", "S", "C", "L"])
      .optional()
      .describe("New product display key"),
    new_product_display_sort: z.enum(["D", "A"]).optional().describe("New product display order"),
    new_product_display_period: z
      .enum(["W", "1D", "3D", "7D", "15D", "1M", "3M", "6M"])
      .optional()
      .describe("New product display period"),
  })
  .strict();

export const CategoryUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    category_no: z.number().int().min(1).describe("Category number"),
    request: CategoryUpdateRequestSchema.describe("Category update payload"),
  })
  .strict();

export type CategoryUpdateParams = z.infer<typeof CategoryUpdateParamsSchema>;

export const CategoryDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
    category_no: z.number().int().min(1).describe("Category number"),
  })
  .strict();

export type CategoryDeleteParams = z.infer<typeof CategoryDeleteParamsSchema>;
