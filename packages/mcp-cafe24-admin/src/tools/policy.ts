import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type PolicyParams,
  PolicyParamsSchema,
  type PolicyUpdateParams,
  PolicyUpdateParamsSchema,
} from "@/schemas/policy.js";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

async function cafe24_get_policy(params: PolicyParams) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/policy", "GET", undefined, queryParams);
    const policy = data.policy || data;

    const truncate = (str: string | undefined | null) => {
      if (!str) return "N/A";
      return str.length > 50 ? `${str.substring(0, 50)}...` : str;
    };

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Policy Settings (Shop #${policy.shop_no || 1})\n\n` +
            `- **Terms of Use**: ${truncate(policy.terms_using_mall)}\n` +
            `- **Privacy Policy (All)**: ${truncate(policy.privacy_all)}\n` +
            `- **Privacy Policy (Signup)**: ${policy.use_privacy_join === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Withdrawal Policy**: ${policy.use_withdrawal === "T" ? "Enabled" : "Disabled"} (Required: ${policy.required_withdrawal === "T" ? "Yes" : "No"})\n`,
        },
      ],
      structuredContent: {
        shop_no: policy.shop_no ?? 1,
        privacy_all: policy.privacy_all,
        terms_using_mall: policy.terms_using_mall,
        use_privacy_join: policy.use_privacy_join,
        privacy_join: policy.privacy_join,
        use_withdrawal: policy.use_withdrawal,
        required_withdrawal: policy.required_withdrawal,
        withdrawal: policy.withdrawal,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_policy(params: PolicyUpdateParams) {
  try {
    const { shop_no, ...settings } = params;

    const requestBody: Record<string, any> = {
      shop_no: shop_no ?? 1,
      request: settings,
    };

    const data = await makeApiRequest("/admin/policy", "PUT", requestBody);
    const policy = data.policy || data;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Policy Settings Updated (Shop #${policy.shop_no || 1})\n\n` +
            `- **Privacy Policy (Signup)**: ${policy.use_privacy_join === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Withdrawal Policy**: ${policy.use_withdrawal === "T" ? "Enabled" : "Disabled"}\n`,
        },
      ],
      structuredContent: {
        shop_no: policy.shop_no ?? 1,
        privacy_all: policy.privacy_all,
        terms_using_mall: policy.terms_using_mall,
        use_privacy_join: policy.use_privacy_join,
        privacy_join: policy.privacy_join,
        use_withdrawal: policy.use_withdrawal,
        required_withdrawal: policy.required_withdrawal,
        withdrawal: policy.withdrawal,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_policy",
    {
      title: "Get Cafe24 Policy Settings",
      description:
        "Retrieve shop policy settings including terms of use, privacy policy (overall and signup), and withdrawal policy status and content.",
      inputSchema: PolicyParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_policy,
  );

  server.registerTool(
    "cafe24_update_policy",
    {
      title: "Update Cafe24 Policy Settings",
      description:
        "Update shop policy settings. Supports standard (S) or custom (C) save types. Can update terms of use, privacy policies, and withdrawal policies.",
      inputSchema: PolicyUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_policy,
  );
}
