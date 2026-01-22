export interface SMSRequest {
  shop_no?: number;
  request: {
    sender_no: number;
    content: string;
    recipients?: string[];
    member_id?: string[];
    group_no?: number;
    exclude_unsubscriber?: "T" | "F";
    type?: "SMS" | "LMS";
    title?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SMSSendResponse {
  sms: {
    queue_code: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SMSBalance {
  balance: string;
  sms_count: number;
  lms_count: number;
}

export interface SMSBalanceResponse {
  sms: SMSBalance;
  [key: string]: unknown;
}
export interface SMSReceiver {
  no: number;
  recipient_type: "All" | "S" | "A";
  supplier_name: string | null;
  supplier_id: string | null;
  user_name: string | null;
  user_id: string | null;
  manager_name: string | null;
  cellphone: string;
}

export interface SMSReceiverListResponse {
  receivers: SMSReceiver[];
  links?: {
    rel: string;
    href: string;
  }[];
  [key: string]: unknown;
}

export interface SMSSender {
  sender_no: number;
  sender: string;
  auth_status: "00" | "10" | "20" | "30" | "40";
  memo: {
    request_reason: string;
    reject_reason: string;
  };
}

export interface SMSSenderListResponse {
  senders: SMSSender[];
  [key: string]: unknown;
}
