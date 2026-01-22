import { z } from "zod";

export const CustomersSearchParamsSchema = z
  .object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe("Maximum results to return (1-100)"),
    offset: z.number().int().min(0).default(0).describe("Number of results to skip"),
    member_id: z.string().optional().describe("Filter by member ID"),
    email: z.string().optional().describe("Filter by email"),
    name: z.string().optional().describe("Filter by name"),
  })
  .strict();

export const CustomerDetailParamsSchema = z
  .object({
    member_id: z.string().describe("Member ID"),
  })
  .strict();

export const CustomerSettingParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

export const CustomerSettingUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    simple_member_join: z
      .enum(["T", "F"])
      .optional()
      .describe("Join form display: T=Basic, F=Detailed"),
    member_authentication: z
      .enum(["T", "F"])
      .optional()
      .describe("Member authentication: T=Yes, F=No"),
    minimum_age_restriction: z
      .enum(["M", "T", "F"])
      .optional()
      .describe("Under 14 restriction: M=After auth, T=Direct use, F=No join"),
    join_standard: z.enum(["id", "email"]).optional().describe("Join standard: id or email"),
    use_update_birthday: z
      .enum(["T", "F"])
      .optional()
      .describe("Allow birthday update: T=Yes, F=No"),
  })
  .strict();

export const CustomerPrivacyParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number (default: 1)"),
    member_id: z.string().max(200).optional().describe("Member ID(s), comma-separated"),
    cellphone: z.string().max(200).optional().describe("Mobile number(s), comma-separated"),
  })
  .strict()
  .refine((data) => data.member_id || data.cellphone, {
    message: "Either member_id or cellphone must be provided",
    path: ["member_id"],
  });

export const CustomerAutoUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number (default: 1)"),
    member_id: z.string().max(20).describe("Member ID"),
  })
  .strict();

export const CustomerWishlistParamsSchema = z
  .object({
    member_id: z.string().describe("Member ID"),
    shop_no: z.number().int().min(1).optional().describe("Shop Number (default: 1)"),
  })
  .strict();

export const CustomersPrivacySearchParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).default(1).describe("Shop Number (default: 1)"),
    search_type: z
      .enum(["customer_info", "created_date"])
      .default("customer_info")
      .describe("Search type"),
    created_start_date: z.string().optional().describe("Search start date for join date criteria"),
    member_id: z.string().max(20).optional().describe("Member ID"),
    news_mail: z.enum(["T", "F", "D"]).optional().describe("Whether to receive news mails"),
    sms: z.enum(["T", "F"]).optional().describe("Whether to receive SMS"),
    thirdparty_agree: z
      .enum(["T", "F"])
      .optional()
      .describe("Agree to provide info to third parties"),
    group_no: z.number().int().optional().describe("Group number"),
    search_field: z
      .enum(["id", "name", "hp", "tel", "mail", "shop_name"])
      .optional()
      .describe("Search field"),
    keyword: z.string().optional().describe("Keyword"),
    date_type: z
      .enum(["join", "log-in", "age", "account_reactivation", "Wedding"])
      .optional()
      .describe("Date type"),
    start_date: z.string().optional().describe("Search Start Date (YYYY-MM-DD HH:MM:SS)"),
    end_date: z.string().optional().describe("Search End Date (YYYY-MM-DD HH:MM:SS)"),
    member_type: z.enum(["P", "C", "F", "p", "c", "f"]).optional().describe("Member type"),
    member_class: z.enum(["P", "C", "F", "p", "c", "f"]).optional().describe("Member class"),
    residence: z.string().optional().describe("Residence"),
    gender: z.enum(["M", "F", "m", "f"]).optional().describe("Gender"),
    member_authority: z.enum(["C", "P", "A", "S"]).default("C").describe("Member authority"),
    join_path: z.enum(["P", "M"]).optional().describe("Sign up medium"),
    use_mobile_app: z.enum(["T", "F"]).optional().describe("Whether to use mobile app"),
    fixed_group: z.enum(["T", "F"]).optional().describe("Customer tier fixing settings"),
    is_simple_join: z.enum(["T", "F"]).optional().describe("Joined via quick sign-up"),
    limit: z.number().int().min(1).max(1000).default(30).describe("Limit"),
    offset: z.number().int().max(8000).default(0).describe("Offset"),
  })
  .strict();

export const CustomersPrivacyDetailParamsSchema = z
  .object({
    member_id: z.string().max(20).describe("Member ID"),
    shop_no: z.number().int().min(1).default(1).describe("Shop Number (default: 1)"),
  })
  .strict();

export const CustomersPrivacyUpdateParamsSchema = z
  .object({
    member_id: z.string().max(20).describe("Member ID"),
    shop_no: z.number().int().min(1).default(1).describe("Shop Number (default: 1)"),
    request: z
      .object({
        cellphone: z.string().optional().describe("Mobile"),
        email: z.string().email().optional().describe("Email"),
        sms: z.enum(["T", "F"]).optional().describe("Whether to receive SMS"),
        news_mail: z.enum(["T", "F", "D"]).optional().describe("Whether to receive news mails"),
        thirdparty_agree: z
          .enum(["T", "F"])
          .optional()
          .describe("Agree to provide info to third parties"),
        birthday: z.string().optional().describe("Birthday"),
        solar_calendar: z.enum(["T", "F"]).optional().describe("Solar calendar"),
        address1: z.string().max(255).optional().describe("Address 1"),
        address2: z.string().max(255).optional().describe("Address 2"),
        zipcode: z.string().max(14).optional().describe("Zipcode"),
        recommend_id: z.string().max(20).optional().describe("Referrer ID"),
        gender: z.enum(["M", "F"]).optional().describe("Gender"),
        country_code: z.string().optional().describe("Country code"),
        city: z.string().max(255).optional().describe("City / Town"),
        state: z.string().max(255).optional().describe("State"),
        refund_bank_code: z.string().max(20).optional().describe("Refund bank code"),
        refund_bank_account_no: z
          .string()
          .max(40)
          .optional()
          .describe("Refund bank account number"),
        refund_bank_account_holder: z.string().optional().describe("Refund bank account holder"),
        fixed_group: z.enum(["T", "F"]).optional().describe("Customer tier fixing settings"),
        additional_information: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            }),
          )
          .optional()
          .describe("Additional information list"),
      })
      .strict()
      .describe("Update request fields"),
  })
  .strict();
