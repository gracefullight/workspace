import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  type SeoSettingsParams,
  SeoSettingsParamsSchema,
  type SeoSettingsUpdateParams,
  SeoSettingsUpdateParamsSchema,
} from "@/schemas/seo.js";

import { handleApiError, makeApiRequest } from "../services/api-client.js";

async function cafe24_get_seo_setting(params: SeoSettingsParams) {
  try {
    const queryParams: Record<string, any> = {};
    if (params.shop_no) {
      queryParams.shop_no = params.shop_no;
    }

    const data = await makeApiRequest("/admin/seo/setting", "GET", undefined, queryParams);
    const seo = data.seo || data;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## SEO Settings (Shop #${seo.shop_no || 1})\n\n` +
            `- **Title**: ${seo.common_page_title || "N/A"}\n` +
            `- **Description**: ${seo.common_page_meta_description || "N/A"}\n` +
            `- **Google Search Console**: ${seo.use_google_search_console === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Naver Search Advisor**: ${seo.use_naver_search_advisor === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Sitemap Auto Update**: ${seo.use_sitemap_auto_update === "T" ? "Enabled" : "Disabled"}\n` +
            `- **RSS Feed**: ${seo.use_rss === "T" ? "Enabled" : "Disabled"}\n` +
            `- **Favicon**: ${seo.favicon || "N/A"}\n` +
            `- **Robots.txt (PC)**: ${seo.robots_text ? "Configured" : "Empty"}\n` +
            `- **LLMs Text**: ${seo.llms_text ? "Configured" : "Empty"}\n`,
        },
      ],
      structuredContent: seo as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_seo_setting(params: SeoSettingsUpdateParams) {
  try {
    const { shop_no, ...settings } = params;
    const requestBody = {
      shop_no,
      request: settings,
    };

    const data = await makeApiRequest("/admin/seo/setting", "PUT", requestBody);
    const seo = data.seo || data;

    return {
      content: [
        {
          type: "text" as const,
          text: `SEO settings updated successfully for Shop #${seo.shop_no || 1}`,
        },
      ],
      structuredContent: seo as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_seo_setting",
    {
      title: "Get Cafe24 SEO Settings",
      description:
        "Retrieve SEO settings including page titles, meta descriptions, favicons, search engine verification (Google/Naver), robots.txt, and Open Graph settings.",
      inputSchema: SeoSettingsParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_seo_setting,
  );

  server.registerTool(
    "cafe24_update_seo_setting",
    {
      title: "Update Cafe24 SEO Settings",
      description:
        "Update SEO settings. Configure titles, meta descriptions, search engine verification codes, social media sharing (Open Graph), sitemaps, RSS, and crawler access controls.",
      inputSchema: SeoSettingsUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_update_seo_setting,
  );
}
