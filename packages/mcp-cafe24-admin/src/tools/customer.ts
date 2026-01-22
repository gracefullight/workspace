import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import {
  CustomerAutoUpdateParamsSchema,
  CustomerDetailParamsSchema,
  CustomerPrivacyParamsSchema,
  CustomerSettingParamsSchema,
  CustomerSettingUpdateParamsSchema,
  CustomersPrivacyDetailParamsSchema,
  CustomersPrivacySearchParamsSchema,
  CustomersPrivacyUpdateParamsSchema,
  CustomersSearchParamsSchema,
  CustomerWishlistParamsSchema,
} from "@/schemas/customer.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type {
  Customer,
  CustomerAutoUpdateParams,
  CustomerAutoUpdateResponse,
  CustomerPrivacyDetailResponse,
  CustomerPrivacyParams,
  CustomerPrivacyResponse,
  CustomerSetting,
  CustomersPrivacyCountResponse,
  CustomersPrivacyResponse,
  CustomerWishlistCountResponse,
  CustomerWishlistResponse,
} from "@/types/index.js";

async function cafe24_list_customers(params: z.infer<typeof CustomersSearchParamsSchema>) {
  try {
    const data = await makeApiRequest<{ customers: Customer[]; total: number }>(
      "/admin/customers",
      "GET",
      undefined,
      {
        limit: params.limit,
        offset: params.offset,
        ...(params.member_id ? { member_id: params.member_id } : {}),
        ...(params.email ? { email: params.email } : {}),
        ...(params.name ? { member_name: params.name } : {}),
      },
    );

    const customers = data.customers || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} customers (showing ${customers.length})\n\n` +
            customers
              .map(
                (c) =>
                  `## ${c.member_name || c.member_id} (${c.member_id})\n` +
                  `- **Email**: ${c.email}\n` +
                  `- **Phone**: ${c.phone || "N/A"}\n` +
                  `- **Join Date**: ${c.join_date}\n` +
                  `- **Group**: ${c.group || "N/A"}\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        total,
        count: customers.length,
        offset: params.offset,
        customers: customers.map((c) => ({
          id: c.member_id,
          name: c.member_name,
          email: c.email,
          phone: c.phone,
          birthdate: c.birthdate,
          gender: c.gender,
          join_date: c.join_date,
          group: c.group,
        })),
        has_more: total > params.offset + customers.length,
        ...(total > params.offset + customers.length
          ? {
              next_offset: params.offset + customers.length,
            }
          : {}),
      },
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_get_customer(params: z.infer<typeof CustomerDetailParamsSchema>) {
  try {
    const data = await makeApiRequest<{ customer: Customer }>(
      `/admin/customers/${params.member_id}`,
      "GET",
    );
    const customer = data.customer || {};

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Customer Details\n\n` +
            `- **Member ID**: ${customer.member_id}\n` +
            `- **Name**: ${customer.member_name}\n` +
            `- **Email**: ${customer.email}\n` +
            `- **Phone**: ${customer.phone || "N/A"}\n` +
            `- **Birthdate**: ${customer.birthdate || "N/A"}\n` +
            `- **Gender**: ${customer.gender || "N/A"}\n` +
            `- **Join Date**: ${customer.join_date}\n`,
        },
      ],
      structuredContent: {
        id: customer.member_id,
        name: customer.member_name,
        email: customer.email,
        phone: customer.phone,
        birthdate: customer.birthdate,
        gender: customer.gender,
        join_date: customer.join_date,
      },
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

async function cafe24_get_customer_setting(params: z.infer<typeof CustomerSettingParamsSchema>) {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest<{ customer: CustomerSetting }>(
      "/admin/customers/setting",
      "GET",
      undefined,
      queryParams,
    );
    const customer = data.customer || data;

    const joinFormMap: Record<string, string> = { T: "Basic fields", F: "Detailed fields" };
    const ageRestrictionMap: Record<string, string> = {
      M: "After authentication",
      T: "Direct use without auth",
      F: "No registration allowed",
    };
    const genderMap: Record<string, string> = { B: "None", M: "Male only", F: "Female only" };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Customer Settings (Shop #${customer.shop_no || 1})\n\n` +
            `- **Join Form**: ${joinFormMap[customer.simple_member_join] || customer.simple_member_join}\n` +
            `- **Member Auth**: ${customer.member_authentication === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Under 14 Restriction**: ${ageRestrictionMap[customer.minimum_age_restriction] || customer.minimum_age_restriction}\n` +
            `- **Under 19 Restriction**: ${customer.adult_age_restriction === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Gender Restriction**: ${genderMap[customer.gender_restriction] || customer.gender_restriction}\n` +
            `- **Rejoin Restriction**: ${customer.member_rejoin_restriction === "T" ? `${customer.member_rejoin_restriction_day} days` : "Disabled"}\n` +
            `- **Join Standard**: ${customer.join_standard}\n` +
            `- **Display Group**: ${customer.display_group === "T" ? "Yes" : "No"}\n`,
        },
      ],
      structuredContent: {
        shop_no: customer.shop_no ?? 1,
        simple_member_join: customer.simple_member_join,
        member_authentication: customer.member_authentication,
        minimum_age_restriction: customer.minimum_age_restriction,
        adult_age_restriction: customer.adult_age_restriction,
        adult_purchase_restriction: customer.adult_purchase_restriction,
        adult_image_restriction: customer.adult_image_restriction,
        gender_restriction: customer.gender_restriction,
        member_rejoin_restriction: customer.member_rejoin_restriction,
        member_rejoin_restriction_day: customer.member_rejoin_restriction_day,
        password_authentication: customer.password_authentication,
        member_join_confirmation: customer.member_join_confirmation,
        email_duplication: customer.email_duplication,
        password_recovery: customer.password_recovery,
        link_social_account: customer.link_social_account,
        save_member_id: customer.save_member_id,
        unregistration_admin_approval: customer.unregistration_admin_approval,
        unregistration_reason: customer.unregistration_reason,
        display_group: customer.display_group,
        join_standard: customer.join_standard,
        use_update_birthday: customer.use_update_birthday,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_customer_setting(
  params: z.infer<typeof CustomerSettingUpdateParamsSchema>,
) {
  try {
    const { shop_no, ...settings } = params;

    const requestBody: Record<string, unknown> = {
      shop_no: shop_no ?? 1,
      request: settings,
    };

    const data = await makeApiRequest<{ customer: CustomerSetting }>(
      "/admin/customers/setting",
      "PUT",
      requestBody,
    );
    const customer = data.customer || data;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Customer Settings Updated (Shop #${customer.shop_no || 1})\n\n` +
            `- **Join Form**: ${customer.simple_member_join === "T" ? "Basic" : "Detailed"}\n` +
            `- **Member Auth**: ${customer.member_authentication === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Join Standard**: ${customer.join_standard}\n`,
        },
      ],
      structuredContent: {
        shop_no: customer.shop_no ?? 1,
        simple_member_join: customer.simple_member_join,
        member_authentication: customer.member_authentication,
        minimum_age_restriction: customer.minimum_age_restriction,
        join_standard: customer.join_standard,
        use_update_birthday: customer.use_update_birthday,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_list_customers_privacy(params: CustomerPrivacyParams) {
  try {
    const data = await makeApiRequest<CustomerPrivacyResponse>(
      "/admin/customers",
      "GET",
      undefined,
      params,
    );
    const customers = data.customers || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${customers.length} customers with privacy details\n\n` +
            customers
              .map(
                (c) =>
                  `## ${c.member_id} (Group #${c.group_no})\n` +
                  `- **Auth Status**: ${c.member_authentication}\n` +
                  `- **Verification**: ${c.authentication_method || "None"}\n` +
                  `- **Blacklist**: ${c.use_blacklist === "T" ? `Yes (${c.blacklist_type})` : "No"}\n` +
                  `- **SMS/News**: ${c.sms === "T" ? "Yes" : "No"} / ${c.news_mail}\n` +
                  `- **Points**: Total ${c.total_points}, Avail ${c.available_points}, Used ${c.used_points}\n` +
                  `- **Credits**: ${c.available_credits}\n` +
                  `- **Last Login**: ${c.last_login_date}\n` +
                  `- **Created**: ${c.created_date}\n` +
                  `- **Gender**: ${c.gender}\n` +
                  `- **Mobile App**: ${c.use_mobile_app === "T" ? "Yes" : "No"}\n` +
                  `- **Tier Fixed**: ${c.fixed_group === "T" ? "Yes" : "No"}\n`,
              )
              .join("\n"),
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_customer_auto_update(params: CustomerAutoUpdateParams) {
  try {
    const { member_id, ...queryParams } = params;
    const data = await makeApiRequest<CustomerAutoUpdateResponse>(
      `/admin/customers/${member_id}/autoupdate`,
      "GET",
      undefined,
      queryParams,
    );
    const s = data.autoupdate;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `# Customer Tier Auto-Update Status: ${s.member_id}\n\n` +
            `- **Shop No**: ${s.shop_no}\n` +
            `- **Next Tier**: ${s.next_grade || "N/A"}\n` +
            `- **Current Total Purchase**: ${s.total_purchase_amount.toLocaleString()} amt / ${s.total_purchase_count} count\n` +
            `- **Required for Next Tier**: ${s.required_purchase_amount.toLocaleString()} amt / ${s.required_purchase_count} count\n`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_list_customers_privacy_info(
  params: z.infer<typeof CustomersPrivacySearchParamsSchema>,
) {
  try {
    const data = await makeApiRequest<CustomersPrivacyResponse>(
      "/admin/customersprivacy",
      "GET",
      undefined,
      params,
    );
    const customers = data.customersprivacy || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${customers.length} customer privacy records\n\n` +
            customers
              .map(
                (c) =>
                  `## ${c.name} (${c.member_id})\n` +
                  `- **Email**: ${c.email}\n` +
                  `- **Phone**: ${c.cellphone || c.phone || "N/A"}\n` +
                  `- **Group**: ${c.group_no}\n` +
                  `- **Address**: ${c.address1} ${c.address2}\n` +
                  `- **Points**: ${c.available_points} avail / ${c.total_points} total\n`,
              )
              .join("\n"),
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_count_customers_privacy_info(
  params: z.infer<typeof CustomersPrivacySearchParamsSchema>,
) {
  try {
    const data = await makeApiRequest<CustomersPrivacyCountResponse>(
      "/admin/customersprivacy/count",
      "GET",
      undefined,
      params,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found **${data.count}** customer privacy records matching filters.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_customer_privacy_info(
  params: z.infer<typeof CustomersPrivacyDetailParamsSchema>,
) {
  try {
    const { member_id, ...queryParams } = params;
    const data = await makeApiRequest<CustomerPrivacyDetailResponse>(
      `/admin/customersprivacy/${member_id}`,
      "GET",
      undefined,
      queryParams,
    );
    const c = data.customersprivacy;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `# Customer Privacy Details: ${c.name} (${c.member_id})\n\n` +
            `## Basic Info\n` +
            `- **English Name**: ${c.name_english || "N/A"}\n` +
            `- **Gender**: ${c.gender}\n` +
            `- **Birthday**: ${c.birthday} (${c.solar_calendar === "T" ? "Solar" : "Lunar"})\n` +
            `- **Join Date**: ${c.created_date}\n\n` +
            `## Contact Info\n` +
            `- **Email**: ${c.email}\n` +
            `- **Mobile**: ${c.cellphone}\n` +
            `- **Phone**: ${c.phone}\n` +
            `- **Address**: [${c.zipcode}] ${c.address1} ${c.address2}\n\n` +
            `## Accounting\n` +
            `- **Points**: Avail: ${c.available_points}, Total: ${c.total_points}, Used: ${c.used_points}\n` +
            `- **Credits**: ${c.available_credits}\n\n` +
            `## Settings\n` +
            `- **Auth Status**: ${c.member_authentication}\n` +
            `- **Authority**: ${c.member_authority}\n` +
            `- **Fixed Group**: ${c.fixed_group}\n` +
            `- **Blacklist**: ${c.use_blacklist === "T" ? `Yes (${c.blacklist_type})` : "No"}\n`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_customer_privacy_info(
  params: z.infer<typeof CustomersPrivacyUpdateParamsSchema>,
) {
  try {
    const { member_id, shop_no, request } = params;
    const data = await makeApiRequest<CustomerPrivacyDetailResponse>(
      `/admin/customersprivacy/${member_id}`,
      "PUT",
      { shop_no, request },
    );
    const _c = data.customersprivacy;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated privacy details for **${member_id}**.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_list_customer_wishlist(params: z.infer<typeof CustomerWishlistParamsSchema>) {
  try {
    const { member_id, ...queryParams } = params;
    const data = await makeApiRequest<CustomerWishlistResponse>(
      `/admin/customers/${member_id}/wishlist`,
      "GET",
      undefined,
      queryParams,
    );
    const wishlist = data.wishlist || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `# Wishlist for ${member_id}\n\n` +
            wishlist
              .map(
                (item) =>
                  `## Product #${item.product_no} (Wishlist #${item.wishlist_no})\n` +
                  `- **Variant**: ${item.variant_code}\n` +
                  `- **Price**: ${item.price}\n` +
                  `- **Added Date**: ${item.created_date}\n` +
                  (item.additional_option
                    ? `- **Additional Options**: ${item.additional_option.map((o) => `${o.option_name}: ${o.option_value}`).join(", ")}\n`
                    : ""),
              )
              .join("\n"),
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_count_customer_wishlist(
  params: z.infer<typeof CustomerWishlistParamsSchema>,
) {
  try {
    const { member_id, ...queryParams } = params;
    const data = await makeApiRequest<CustomerWishlistCountResponse>(
      `/admin/customers/${member_id}/wishlist/count`,
      "GET",
      undefined,
      queryParams,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Customer ${member_id} has **${data.count}** items in their wishlist.`,
        },
      ],
      structuredContent: data,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_customers",
    {
      title: "List Cafe24 Customers",
      description:
        "Retrieve a list of customers from Cafe24. Returns customer details including member ID, name, email, phone, birthdate, gender, join date, and group. Supports pagination and filtering by member ID, email, or name.",
      inputSchema: CustomersSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_customers,
  );

  server.registerTool(
    "cafe24_get_customer",
    {
      title: "Get Cafe24 Customer Details",
      description:
        "Retrieve detailed information about a specific customer by member ID. Returns complete customer details including personal information and join date.",
      inputSchema: CustomerDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_customer,
  );

  server.registerTool(
    "cafe24_get_customer_setting",
    {
      title: "Get Cafe24 Customer Settings",
      description:
        "Retrieve customer/member settings including join form type, authentication, age restrictions, gender restrictions, rejoin policy, password recovery, SNS linking, and display options.",
      inputSchema: CustomerSettingParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_customer_setting,
  );

  server.registerTool(
    "cafe24_update_customer_setting",
    {
      title: "Update Cafe24 Customer Settings",
      description:
        "Update customer/member settings including join form type (T=Basic, F=Detailed), authentication, age restrictions (M/T/F), join standard (id/email), and birthday update permission.",
      inputSchema: CustomerSettingUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_customer_setting,
  );

  server.registerTool(
    "cafe24_list_customers_privacy",
    {
      title: "List Cafe24 Customers Privacy Details",
      description:
        "Retrieve detailed privacy information for customers using member ID or cellphone. Returns authentication, points, credits, blacklist status, and tier fixing settings. Requires either member_id or cellphone.",
      inputSchema: CustomerPrivacyParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_customers_privacy,
  );

  server.registerTool(
    "cafe24_get_customer_auto_update",
    {
      title: "Get Cafe24 Customer Tier Auto-Update Status",
      description: "Retrieve a customer's progress toward the next tier (grade).",
      inputSchema: CustomerAutoUpdateParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_customer_auto_update,
  );

  server.registerTool(
    "cafe24_list_customer_wishlist",
    {
      title: "List Cafe24 Customer Wishlist",
      description: "Retrieve a list of products in a customer's wishlist by member ID.",
      inputSchema: CustomerWishlistParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_customer_wishlist,
  );

  server.registerTool(
    "cafe24_count_customer_wishlist",
    {
      title: "Count Cafe24 Customer Wishlist",
      description: "Retrieve the number of products in a customer's wishlist by member ID.",
      inputSchema: CustomerWishlistParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_customer_wishlist,
  );

  server.registerTool(
    "cafe24_list_customers_privacy_info",
    {
      title: "List Cafe24 Customers Privacy Info",
      description:
        "Retrieve a list of customers' privacy information from the /admin/customersprivacy endpoint. Returns extensive details including names, contact info, addresses, points, and more. Supports many filtering options.",
      inputSchema: CustomersPrivacySearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_customers_privacy_info,
  );

  server.registerTool(
    "cafe24_count_customers_privacy_info",
    {
      title: "Count Cafe24 Customers Privacy Info",
      description:
        "Retrieve the number of customer privacy records matching the specified filters.",
      inputSchema: CustomersPrivacySearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_customers_privacy_info,
  );

  server.registerTool(
    "cafe24_get_customer_privacy_info",
    {
      title: "Get Cafe24 Customer Privacy Info",
      description:
        "Retrieve detailed privacy information for a specific customer by member ID from the /admin/customersprivacy endpoint.",
      inputSchema: CustomersPrivacyDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_customer_privacy_info,
  );

  server.registerTool(
    "cafe24_update_customer_privacy_info",
    {
      title: "Update Cafe24 Customer Privacy Info",
      description:
        "Update privacy information for a specific customer by member ID. Supports updating contact info, birthday, address, bank info, and more.",
      inputSchema: CustomersPrivacyUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_customer_privacy_info,
  );
}
