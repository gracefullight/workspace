export interface Classification extends Record<string, unknown> {
  shop_no: number;
  classification_code: string;
  classification_name: string;
  classification_description?: string;
  use_classification: "T" | "F";
  created_date: string;
  product_count?: number;
}

export interface ClassificationResponse {
  classification: Classification;
}

export interface ClassificationsResponse {
  classifications: Classification[];
}

export interface ClassificationCountResponse {
  count: number;
}
