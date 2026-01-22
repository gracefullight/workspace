import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type CreatePointsAutoExpirationParams,
  CreatePointsAutoExpirationParamsSchema,
  type DeletePointsAutoExpirationParams,
  DeletePointsAutoExpirationParamsSchema,
  type MileageSearchParams,
  MileageSearchParamsSchema,
  type PointsAutoExpirationParams,
  PointsAutoExpirationParamsSchema,
  type PointsReportSearchParams,
  PointsReportSearchParamsSchema,
  type PointsSettingParams,
  PointsSettingParamsSchema,
  type PointsSettingUpdateParams,
  PointsSettingUpdateParamsSchema,
} from "@/schemas/points.js";
import { handleApiError, makeApiRequest } from "@/services/api-client.js";
import type {
  CreatePointsAutoExpirationResponse,
  DeletePointsAutoExpirationResponse,
  GetPointsAutoExpirationResponse,
  GetPointsReportResponse,
  Point,
} from "@/types/index.js";

async function cafe24_get_points_setting(params: PointsSettingParams) {
  try {
    const data = await makeApiRequest("/admin/points/setting", "GET", undefined, {
      shop_no: params.shop_no,
    });
    const responseData = data as { point?: Record<string, unknown> } | Record<string, unknown>;
    const point = (responseData.point || responseData) as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Points/Mileage Settings (Shop #${point.shop_no})\n\n` +
            `- **Name**: ${point.name}\n` +
            `- **Issuance Standard**: ${point.point_issuance_standard === "C" ? "After Delivery" : "After Purchase Confirmation"}\n` +
            `- **Payment Period**: ${point.payment_period} days\n` +
            `- **Join Point**: ${point.join_point}\n` +
            `- **Format**: ${point.format}\n` +
            `- **Rounding**: ${point.round_type} / Unit: ${point.round_unit}\n` +
            `- **Email Consent Points**: ${point.use_email_agree_point === "T" ? "Yes" : "No"}\n` +
            `- **SMS Consent Points**: ${point.use_sms_agree_point === "T" ? "Yes" : "No"}\n` +
            `- **Consent Points Amount**: ${point.agree_point}\n`,
        },
      ],
      structuredContent: point as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_points_setting(params: PointsSettingUpdateParams) {
  try {
    const { shop_no, ...settings } = params;
    const data = await makeApiRequest("/admin/points/setting", "PUT", {
      shop_no,
      request: settings,
    });
    const responseData = data as { point?: Record<string, unknown> } | Record<string, unknown>;
    const point = (responseData.point || responseData) as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Points settings updated for Shop #${point.shop_no}`,
        },
      ],
      structuredContent: point as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_points(params: MileageSearchParams) {
  try {
    const data = await makeApiRequest<{ points: Point[]; total: number }>(
      "/admin/points",
      "GET",
      undefined,
      {
        limit: params.limit,
        offset: params.offset,
        ...(params.start_date ? { start_date: params.start_date } : {}),
        ...(params.end_date ? { end_date: params.end_date } : {}),
      },
    );

    const points = data.points || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} point transactions (showing ${points.length})\n\n` +
            points
              .map(
                (p) =>
                  `## ${p.point_date}\n` +
                  `- **Member**: ${p.member_name} (${p.member_id})\n` +
                  `- **Type**: ${p.point_type || "Earn"}\n` +
                  `- **Amount**: ${p.point}\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        total,
        count: points.length,
        offset: params.offset,
        points: points.map((p) => ({
          id: p.point_id,
          member_id: p.member_id,
          member_name: p.member_name,
          point_type: p.point_type,
          point: p.point,
          point_date: p.point_date,
        })),
        has_more: total > params.offset + points.length,
        ...(total > params.offset + points.length
          ? { next_offset: params.offset + points.length }
          : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_points_autoexpiration(params: PointsAutoExpirationParams) {
  try {
    const data = await makeApiRequest<GetPointsAutoExpirationResponse>(
      "/admin/points/autoexpiration",
      "GET",
      undefined,
      { shop_no: params.shop_no },
    );

    const settings = data.autoexpiration;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Points Auto Expiration Settings (Shop #${settings.shop_no})\n\n` +
            `- **Expiration Date**: ${settings.expiration_date}\n` +
            `- **Interval**: Every ${settings.interval_month} month(s)\n` +
            `- **Target Period**: Points older than ${settings.target_period_month} months\n` +
            `- **Group**: ${settings.group_no === 0 ? "All Customers" : `Group #${settings.group_no}`}\n` +
            `- **Minimum Point**: ${settings.standard_point}\n` +
            `- **Email Notification**: ${settings.send_email === "T" ? "Yes" : "No"}\n` +
            `- **SMS Notification**: ${settings.send_sms === "T" ? "Yes" : "No"}\n` +
            `- **Notification Days**: ${settings.notification_time_day.join(", ")} days before\n`,
        },
      ],
      structuredContent: settings as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_points_autoexpiration(params: CreatePointsAutoExpirationParams) {
  try {
    const { shop_no, ...requestBody } = params;
    const data = await makeApiRequest<CreatePointsAutoExpirationResponse>(
      "/admin/points/autoexpiration",
      "POST",
      {
        shop_no,
        request: requestBody,
      },
    );

    const settings = data.autoexpiration;

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully configured points auto expiration for Shop #${settings.shop_no}.`,
        },
      ],
      structuredContent: settings as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_points_autoexpiration(params: DeletePointsAutoExpirationParams) {
  try {
    const data = await makeApiRequest<DeletePointsAutoExpirationResponse>(
      "/admin/points/autoexpiration",
      "DELETE",
      { shop_no: params.shop_no },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully deleted points auto expiration settings for Shop #${data.autoexpiration.shop_no}.`,
        },
      ],
      structuredContent: data.autoexpiration as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_points_report(params: PointsReportSearchParams) {
  try {
    const data = await makeApiRequest<GetPointsReportResponse>(
      "/admin/points/report",
      "GET",
      undefined,
      {
        shop_no: params.shop_no,
        member_id: params.member_id,
        email: params.email,
        group_no: params.group_no,
        start_date: params.start_date,
        end_date: params.end_date,
      },
    );

    const report = data.report;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `## Points Report (Shop #${report.shop_no})\n\n` +
            `- **Available Points Increase**: ${report.available_points_increase}\n` +
            `- **Available Points Decrease**: ${report.available_points_decrease}\n` +
            `- **Available Points Total**: ${report.available_points_total}\n` +
            `- **Unavailable Points**: ${report.unavailable_points}\n` +
            `- **Unavailable Coupon Points**: ${report.unavailable_coupon_points}\n`,
        },
      ],
      structuredContent: report as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_points_setting",
    {
      title: "Get Cafe24 Points Settings",
      description:
        "Retrieve points/mileage configuration settings including issuance standards, naming, formatting, and consent rewards.",
      inputSchema: PointsSettingParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_points_setting,
  );

  server.registerTool(
    "cafe24_update_points_setting",
    {
      title: "Update Cafe24 Points Settings",
      description:
        "Update points/mileage configuration settings. Only provided fields will be updated.",
      inputSchema: PointsSettingUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_update_points_setting,
  );

  server.registerTool(
    "cafe24_get_points",
    {
      title: "Get Cafe24 Points Transactions",
      description:
        "Retrieve point/mileage transactions from Cafe24. Requires date range and supports pagination. Returns point details including member ID, type, amount, and date.",
      inputSchema: MileageSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_points,
  );

  server.registerTool(
    "cafe24_get_points_autoexpiration",
    {
      title: "Get Points Auto Expiration Settings",
      description:
        "Retrieve auto expiration settings for points including interval, target period, and notifications.",
      inputSchema: PointsAutoExpirationParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_points_autoexpiration,
  );

  server.registerTool(
    "cafe24_create_points_autoexpiration",
    {
      title: "Configure Points Auto Expiration",
      description: "Set up or update auto expiration rules for points.",
      inputSchema: CreatePointsAutoExpirationParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_points_autoexpiration,
  );

  server.registerTool(
    "cafe24_delete_points_autoexpiration",
    {
      title: "Delete Points Auto Expiration Settings",
      description: "Remove auto expiration configurations for points.",
      inputSchema: DeletePointsAutoExpirationParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_delete_points_autoexpiration,
  );

  server.registerTool(
    "cafe24_get_points_report",
    {
      title: "Get Points Report",
      description: "Retrieve a summary report of points/mileage within a specified period.",
      inputSchema: PointsReportSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_points_report,
  );
}
