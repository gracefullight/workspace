export type DatabridgeLogSuccess = "T" | "F";

export interface DatabridgeLog {
  log_id: string;
  mall_id: string;
  trace_id: string;
  requested_time: string;
  request_endpoint: string;
  request_body: string;
  success: DatabridgeLogSuccess;
  response_http_code: string;
  response_body: string;
}

export interface DatabridgeLogLink {
  rel: string;
  href: string;
}

export interface DatabridgeLogsResponse {
  logs: DatabridgeLog[];
  links?: DatabridgeLogLink[];
}
