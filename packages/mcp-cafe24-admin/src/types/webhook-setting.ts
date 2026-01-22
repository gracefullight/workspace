export type WebhookReceptionStatus = "T" | "F";

export interface WebhookSetting extends Record<string, unknown> {
  scopes?: string[];
  reception_status: WebhookReceptionStatus;
}

export interface WebhookSettingResponse {
  webhook: WebhookSetting;
}
