import { z } from "zod";

export const ListClassificationsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    classification_code: z.string().optional().describe("Classification code (comma separated)"),
    classification_name: z.string().optional().describe("Classification name (comma separated)"),
    use_classification: z.enum(["T", "F"]).optional().describe("Use classification"),
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

export const CountClassificationsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Shop Number"),
    classification_code: z.string().optional().describe("Classification code (comma separated)"),
    classification_name: z.string().optional().describe("Classification name (comma separated)"),
    use_classification: z.enum(["T", "F"]).optional().describe("Use classification"),
  })
  .strict();

export type ListClassifications = z.infer<typeof ListClassificationsSchema>;
export type CountClassifications = z.infer<typeof CountClassificationsSchema>;
