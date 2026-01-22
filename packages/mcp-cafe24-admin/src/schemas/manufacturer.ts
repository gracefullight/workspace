import { z } from "zod";

export const ListManufacturersSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    manufacturer_code: z.string().optional().describe("Manufacturer code (comma separated)"),
    manufacturer_name: z.string().optional().describe("Manufacturer name (comma separated)"),
    use_manufacturer: z.enum(["T", "F"]).optional().describe("Whether to use a manufacturer"),
    offset: z
      .number()
      .int()
      .min(0)
      .max(8000)
      .optional()
      .default(0)
      .describe("Start location of list"),
    limit: z.number().int().min(1).max(100).optional().default(10).describe("Limit"),
  })
  .strict();

export const RetrieveManufacturerSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    manufacturer_code: z
      .string()
      .length(8)
      .regex(/^[A-Z0-9]+$/)
      .describe("Manufacturer code"),
  })
  .strict();

export const CountManufacturersSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    manufacturer_code: z.string().optional().describe("Manufacturer code (comma separated)"),
    manufacturer_name: z.string().optional().describe("Manufacturer name (comma separated)"),
    use_manufacturer: z.enum(["T", "F"]).optional().describe("Whether to use a manufacturer"),
  })
  .strict();

export const CreateManufacturerSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    request: z
      .object({
        manufacturer_name: z.string().max(50).describe("Manufacturer name"),
        president_name: z.string().max(30).describe("CEO"),
        email: z.string().email().max(255).optional().describe("Email"),
        phone: z.string().max(20).optional().describe("Office phone number"),
        homepage: z.string().url().max(255).optional().describe("Home page"),
        zipcode: z.string().optional().describe("Zipcode"),
        country_code: z.string().optional().describe("Country code"),
        address1: z.string().max(255).optional().describe("Address 1"),
        address2: z.string().max(255).optional().describe("Address 2"),
        use_manufacturer: z
          .enum(["T", "F"])
          .optional()
          .default("T")
          .describe("Whether to use a manufacturer"),
      })
      .strict(),
  })
  .strict();

export const UpdateManufacturerSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    manufacturer_code: z
      .string()
      .length(8)
      .regex(/^[A-Z0-9]+$/)
      .describe("Manufacturer code"),
    request: z
      .object({
        manufacturer_name: z.string().max(50).optional().describe("Manufacturer name"),
        president_name: z.string().max(30).optional().describe("CEO"),
        email: z.string().email().max(255).optional().describe("Email"),
        phone: z.string().max(20).optional().describe("Office phone number"),
        homepage: z.string().url().max(255).optional().describe("Home page"),
        zipcode: z.string().optional().describe("Zipcode"),
        country_code: z.string().optional().describe("Country code"),
        address1: z.string().max(255).optional().describe("Address 1"),
        address2: z.string().max(255).optional().describe("Address 2"),
        use_manufacturer: z.enum(["T", "F"]).optional().describe("Whether to use a manufacturer"),
      })
      .strict(),
  })
  .strict();

export type ListManufacturers = z.infer<typeof ListManufacturersSchema>;
export type RetrieveManufacturer = z.infer<typeof RetrieveManufacturerSchema>;
export type CountManufacturers = z.infer<typeof CountManufacturersSchema>;
export type CreateManufacturer = z.infer<typeof CreateManufacturerSchema>;
export type UpdateManufacturer = z.infer<typeof UpdateManufacturerSchema>;
