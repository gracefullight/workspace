import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type GetSMSBalance,
  GetSMSBalanceSchema,
  type ListSMSReceivers,
  ListSMSReceiversSchema,
  type ListSMSSenders,
  ListSMSSendersSchema,
  type SendSMS,
  SendSMSSchema,
} from "@/schemas/sms.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type {
  SMSBalanceResponse,
  SMSReceiverListResponse,
  SMSRequest,
  SMSSenderListResponse,
  SMSSendResponse,
} from "@/types/index.js";

/**
 * Send SMS or LMS messages
 */
async function cafe24_send_sms(params: SendSMS) {
  try {
    const response = await makeApiRequest<SMSSendResponse>(
      "/admin/sms",
      "POST",
      params as unknown as SMSRequest,
    );

    const { queue_code } = response.sms;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully queued SMS/LMS message.\n\n**Queue Code:** ${queue_code}`,
        },
      ],
      structuredContent: response,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: handleApiError(error),
        },
      ],
    };
  }
}

/**
 * Get SMS balance
 */
async function cafe24_get_sms_balance(params: GetSMSBalance) {
  try {
    const response = await makeApiRequest<SMSBalanceResponse>("/admin/sms/balance", "GET", params);

    const { balance, sms_count, lms_count } = response.sms;

    return {
      content: [
        {
          type: "text" as const,
          text: `Current SMS Balance:\n\n- **Total Balance:** ${balance}\n- **SMS Count:** ${sms_count}\n- **LMS Count:** ${lms_count}`,
        },
      ],
      structuredContent: response,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: handleApiError(error),
        },
      ],
    };
  }
}

/**
 * Retrieve SMS receivers
 */
async function cafe24_list_sms_receivers(params: ListSMSReceivers) {
  try {
    const response = await makeApiRequest<SMSReceiverListResponse>(
      "/admin/sms/receivers",
      "GET",
      params,
    );

    const receivers = response.receivers;

    if (receivers.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No SMS receivers found.",
          },
        ],
        structuredContent: response,
      };
    }

    const table = receivers
      .map((r) => {
        const name = r.user_name || r.supplier_name || "N/A";
        const id = r.user_id || r.supplier_id || "N/A";
        return `| ${r.no} | ${r.recipient_type} | ${name} | ${id} | ${r.manager_name || "N/A"} | ${r.cellphone} |`;
      })
      .join("\n");

    const markdown = `### SMS Receivers\n\n| No | Type | Name | ID | Manager | Cellphone |\n|---|---|---|---|---|---|\n${table}`;

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
      structuredContent: response,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: handleApiError(error),
        },
      ],
    };
  }
}

/**
 * Retrieve SMS senders
 */
async function cafe24_list_sms_senders(params: ListSMSSenders) {
  try {
    const response = await makeApiRequest<SMSSenderListResponse>(
      "/admin/sms/senders",
      "GET",
      params,
    );

    const senders = response.senders;

    if (senders.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No SMS senders found.",
          },
        ],
        structuredContent: response,
      };
    }

    const table = senders
      .map((s) => {
        const authStatusMap: Record<string, string> = {
          "00": "Deleted",
          "10": "Registered",
          "20": "On Evaluation",
          "30": "Certification Completed",
          "40": "Refusal",
        };
        const status = authStatusMap[s.auth_status] || s.auth_status;
        return `| ${s.sender_no} | ${s.sender} | ${status} | ${s.memo.request_reason || "N/A"} | ${s.memo.reject_reason || "N/A"} |`;
      })
      .join("\n");

    const markdown = `### SMS Senders\n\n| No | Sender | Status | Request Reason | Reject Reason |\n|---|---|---|---|---|\n${table}`;

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
      structuredContent: response,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: handleApiError(error),
        },
      ],
    };
  }
}

/**
 * Register SMS tools
 */
export function registerTools(server: McpServer) {
  server.registerTool(
    "cafe24_send_sms",
    {
      title: "Send SMS",
      description: "Send SMS or LMS messages to customers or numbers",
      inputSchema: SendSMSSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    cafe24_send_sms,
  );

  server.registerTool(
    "cafe24_get_sms_balance",
    {
      title: "Get SMS Balance",
      description: "Get current SMS/LMS balance",
      inputSchema: GetSMSBalanceSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_sms_balance,
  );

  server.registerTool(
    "cafe24_list_sms_receivers",
    {
      title: "List SMS Receivers",
      description: "Retrieve a list of SMS receivers for administrators or suppliers",
      inputSchema: ListSMSReceiversSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_sms_receivers,
  );

  server.registerTool(
    "cafe24_list_sms_senders",
    {
      title: "List SMS Senders",
      description: "Retrieve a list of SMS senders",
      inputSchema: ListSMSSendersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_sms_senders,
  );
}
