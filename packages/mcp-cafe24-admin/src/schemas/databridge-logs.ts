import { z } from "zod";

export const DatabridgeLogsSearchParamsSchema = z
  .object({
    requested_start_date: z
      .string()
      .optional()
      .describe("Requested start date (YYYY-MM-DD or ISO 8601)"),
    requested_end_date: z
      .string()
      .optional()
      .describe("Requested end date (YYYY-MM-DD or ISO 8601)"),
    success: z.enum(["T", "F"]).optional().describe("Webhook sent successfully (T: Yes, F: No)"),
    since_log_id: z.string().optional().describe("Search after this log ID"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(100)
      .describe("Search result limit (1-10000)"),
  })
  .strict();

export type DatabridgeLogsSearchParams = z.infer<typeof DatabridgeLogsSearchParamsSchema>;
