export interface Points {
  shop_no: number;
  case: string;
  member_id: string;
  email: string;
  group_name: string;
  available_points_increase: string | null;
  available_points_decrease: string | null;
  available_points_total: string;
  unavailable_points: string | null;
  order_date: string | null;
  issue_date: string;
  available_date: string | null;
  admin_id: string;
  admin_name: string | null;
  order_id: string | null;
  reason: string;
}

export interface ListPointsResponse {
  points: Points[];
}

export interface AdjustPointsRequest {
  shop_no?: number;
  request: {
    member_id: string;
    order_id?: string;
    amount: string;
    type: "increase" | "decrease";
    reason?: string;
  };
}

export interface AdjustPointsResponse {
  points: {
    shop_no: number;
    member_id: string;
    order_id: string | null;
    amount: string;
    type: "increase" | "decrease";
    reason: string;
  };
}

export interface PointsAutoExpiration {
  shop_no: number;
  expiration_date: string;
  interval_month: number;
  target_period_month: number;
  group_no: number;
  standard_point: string;
  send_email: "T" | "F";
  send_sms: "T" | "F";
  notification_time_day: number[];
}

export interface GetPointsAutoExpirationResponse {
  autoexpiration: PointsAutoExpiration;
}

export interface CreatePointsAutoExpirationRequest {
  shop_no?: number;
  request: {
    expiration_date: string;
    interval_month: number;
    target_period_month: number;
    group_no?: number;
    standard_point: string;
    send_email?: "T" | "F";
    send_sms?: "T" | "F";
    notification_time_day?: number[];
  };
}

export interface CreatePointsAutoExpirationResponse {
  autoexpiration: PointsAutoExpiration;
}

export interface DeletePointsAutoExpirationResponse {
  autoexpiration: {
    shop_no: number;
  };
}
export interface PointsReport {
  shop_no: number;
  available_points_increase: string;
  available_points_decrease: string;
  available_points_total: string;
  unavailable_points: string;
  unavailable_coupon_points: string;
}

export interface GetPointsReportResponse {
  report: PointsReport;
}
