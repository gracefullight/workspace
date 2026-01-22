import { z } from "zod";

export const PointsSettingParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
  })
  .strict();

export const PointsSettingUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
    point_issuance_standard: z
      .enum(["C", "P"])
      .optional()
      .describe("Point issuance standard: C=After Delivery, P=After Purchase Confirmation"),
    payment_period: z
      .number()
      .int()
      .optional()
      .describe("Payment period (days): 0, 1, 3, 7, 14, 20 depending on standard"),
    name: z.string().optional().describe("Point name (e.g., Mileage)"),
    format: z.string().optional().describe("Point display format (e.g., $[:PRICE:])"),
    round_unit: z
      .enum(["F", "0.01", "0.1", "1", "10", "100", "1000"])
      .optional()
      .describe("Rounding unit: F=None, or specific unit"),
    round_type: z
      .enum(["A", "B", "C"])
      .optional()
      .describe("Rounding type: A=Down, B=Half-up, C=Up"),
    display_type: z
      .enum(["P", "W", "WP", "PW"])
      .optional()
      .describe("Display type: P=Rate, W=Amount, WP=Amount/Rate, PW=Rate/Amount"),
    unusable_points_change_type: z
      .enum(["M", "T"])
      .optional()
      .describe("Unusable points conversion: M=First date, T=Last date"),
    join_point: z.string().optional().describe("Join point amount"),
    use_email_agree_point: z
      .enum(["T", "F"])
      .optional()
      .describe("Points for email consent: T=Yes, F=No"),
    use_sms_agree_point: z
      .enum(["T", "F"])
      .optional()
      .describe("Points for SMS consent: T=Yes, F=No"),
    agree_change_type: z
      .enum(["T", "F", "P"])
      .optional()
      .describe("Consent change type: T=Possible, F=Impossible, P=Period restricted"),
    agree_restriction_period: z
      .number()
      .int()
      .optional()
      .describe("Restriction period (months): 1, 3, 6, 12"),
    agree_point: z.string().optional().describe("Consent point amount"),
  })
  .strict();

export const MileageSearchParamsSchema = z
  .object({
    start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe("Maximum results to return (1-100)"),
    offset: z.number().int().min(0).default(0).describe("Number of results to skip"),
  })
  .strict();

export type PointsSettingParams = z.infer<typeof PointsSettingParamsSchema>;
export type PointsSettingUpdateParams = z.infer<typeof PointsSettingUpdateParamsSchema>;
export type MileageSearchParams = z.infer<typeof MileageSearchParamsSchema>;

export const PointsAutoExpirationParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
  })
  .strict();

export const CreatePointsAutoExpirationParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
    expiration_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
      .describe("Expiration start date (YYYY-MM-DD)"),
    interval_month: z
      .union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])
      .describe("Expiration frequency (months): 1, 3, 6, 12"),
    target_period_month: z
      .union([
        z.literal(6),
        z.literal(12),
        z.literal(18),
        z.literal(24),
        z.literal(30),
        z.literal(36),
      ])
      .describe("Points issued over the last N months to expire: 6, 12, 18, 24, 30, 36"),
    group_no: z
      .number()
      .int()
      .default(0)
      .describe("Customer tier group number (0: All customer accounts)"),
    standard_point: z.string().describe("Minimum number of points to expire (e.g., '10.00')"),
    send_email: z.enum(["T", "F"]).default("F").describe("Send email notification: T=Yes, F=No"),
    send_sms: z.enum(["T", "F"]).default("F").describe("Send SMS notification: T=Yes, F=No"),
    notification_time_day: z
      .array(z.number().int())
      .optional()
      .describe("Notification time (days before expiration): 3, 7, 15, 30"),
  })
  .strict();

export const DeletePointsAutoExpirationParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
  })
  .strict();

export type PointsAutoExpirationParams = z.infer<typeof PointsAutoExpirationParamsSchema>;
export type CreatePointsAutoExpirationParams = z.infer<
  typeof CreatePointsAutoExpirationParamsSchema
>;
export type DeletePointsAutoExpirationParams = z.infer<
  typeof DeletePointsAutoExpirationParamsSchema
>;
export const PointsReportSearchParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Multi-shop number (default: 1)"),
    member_id: z.string().max(20).optional().describe("Member ID"),
    email: z.string().email().optional().describe("Email"),
    group_no: z.number().int().optional().describe("Group number"),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "YYYY-MM-DD HH:mm:ss")
      .describe("Search Start Date (YYYY-MM-DD HH:mm:ss)"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "YYYY-MM-DD HH:mm:ss")
      .describe("Search End Date (YYYY-MM-DD HH:mm:ss)"),
  })
  .strict();

export type PointsReportSearchParams = z.infer<typeof PointsReportSearchParamsSchema>;
