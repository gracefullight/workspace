import { z } from "zod";

export const ShippingRateSchema = z.object({
  shipping_rates_min: z.string().describe("Minimum value of the shipping rate range"),
  shipping_rates_max: z.string().describe("Maximum value of the shipping rate range"),
  shipping_fee: z.string().describe("Shipping fee for this range"),
});

export const CountryHsCodeSchema = z.object({
  country_code: z.string().describe("Country code"),
  hscode: z.string().describe("HS code"),
});

export const GetShippingSupplierSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    supplier_id: z.string().describe("Supplier ID"),
  })
  .strict();

export const UpdateShippingSupplierSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    supplier_id: z.string().describe("Supplier ID"),
    request: z
      .object({
        shipping_method: z
          .enum([
            "shipping_01",
            "shipping_02",
            "shipping_04",
            "shipping_05",
            "shipping_06",
            "shipping_07",
            "shipping_08",
            "shipping_09",
          ])
          .optional()
          .describe("Shipping method"),
        shipping_etc: z.string().max(25).optional().nullable().describe("Other shipping methods"),
        shipping_type: z
          .enum(["A", "C", "B"])
          .optional()
          .describe("Domestic/International shipping"),
        shipping_place: z.string().max(127).optional().describe("Shipping area"),
        shipping_start_date: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Shipping start date"),
        shipping_end_date: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Shipping end date"),
        shipping_fee_type: z
          .enum(["T", "R", "M", "D", "W", "C", "N"])
          .optional()
          .describe("Shipping fee type"),
        free_shipping_price: z.string().optional().nullable().describe("Free shipping threshold"),
        shipping_fee: z.string().optional().nullable().describe("Shipping fee"),
        shipping_fee_by_quantity: z
          .string()
          .optional()
          .nullable()
          .describe("Quantity-based shipping rates"),
        shipping_rates: z
          .array(ShippingRateSchema)
          .max(50)
          .optional()
          .describe("Advanced shipping rates setting"),
        prepaid_shipping_fee: z
          .enum(["C", "P", "B"])
          .optional()
          .describe("Whether prepaid shipping fee"),
        shipping_fee_by_product: z
          .enum(["T", "F"])
          .optional()
          .describe("Settings for per-product shipping rates"),
        product_weight: z.string().optional().describe("Product weight"),
        hscode: z.string().max(20).optional().describe("HS code"),
        country_hscode: z
          .array(CountryHsCodeSchema)
          .max(24)
          .optional()
          .describe("HS code by country"),
      })
      .strict(),
  })
  .strict();

export type GetShippingSupplier = z.infer<typeof GetShippingSupplierSchema>;
export type UpdateShippingSupplier = z.infer<typeof UpdateShippingSupplierSchema>;
