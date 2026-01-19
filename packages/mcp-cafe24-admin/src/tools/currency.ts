import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleApiError, makeApiRequest } from "../services/api-client.js";

const CurrencyParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
  })
  .strict();

const CurrencyUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).describe("Multi-shop number (required)"),
    exchange_rate: z.string().describe("Exchange rate (e.g., '1004.00')"),
  })
  .strict();

async function cafe24_get_currency(params: z.infer<typeof CurrencyParamsSchema>) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/currency", "GET", undefined, queryParams);
    const currency = data.currency || data;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Currency Settings\n\n` +
            `- **Exchange Rate**: ${currency.exchange_rate}\n` +
            `- **Standard Currency**: ${currency.standard_currency_code} (${currency.standard_currency_symbol})\n` +
            `- **Shop Currency**: ${currency.shop_currency_code} (${currency.shop_currency_symbol})\n` +
            `- **Format**: ${currency.shop_currency_format}\n`,
        },
      ],
      structuredContent: {
        exchange_rate: currency.exchange_rate,
        standard_currency_code: currency.standard_currency_code,
        standard_currency_symbol: currency.standard_currency_symbol,
        shop_currency_code: currency.shop_currency_code,
        shop_currency_symbol: currency.shop_currency_symbol,
        shop_currency_format: currency.shop_currency_format,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_currency(params: z.infer<typeof CurrencyUpdateParamsSchema>) {
  try {
    const requestBody: Record<string, any> = {
      shop_no: params.shop_no,
      request: {
        exchange_rate: params.exchange_rate,
      },
    };

    const data = await makeApiRequest("/admin/currency", "PUT", requestBody);
    const currency = data.currency || data;

    return {
      content: [
        {
          type: "text" as const,
          text: `## Currency Updated\n\n- **Exchange Rate**: ${currency.exchange_rate}\n`,
        },
      ],
      structuredContent: {
        exchange_rate: currency.exchange_rate,
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_currency",
    {
      title: "Get Cafe24 Currency Settings",
      description:
        "Retrieve currency settings including exchange rate, standard currency (base shop currency), shop currency, and format.",
      inputSchema: CurrencyParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_currency,
  );

  server.registerTool(
    "cafe24_update_currency",
    {
      title: "Update Cafe24 Currency Exchange Rate",
      description:
        "Update the exchange rate for a shop. Requires shop_no and exchange_rate as a string (e.g., '1004.00' or '9.5697').",
      inputSchema: CurrencyUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_currency,
  );
}
