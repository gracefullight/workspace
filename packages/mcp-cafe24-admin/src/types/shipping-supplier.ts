export interface ShippingRate {
  shipping_rates_min: string;
  shipping_rates_max: string;
  shipping_fee: string;
}

export interface CountryHsCode {
  country_code: string;
  hscode: string;
}

export interface ShippingSupplier extends Record<string, unknown> {
  shop_no: number;
  supplier_id: string;
  supplier_code: string;
  shipping_method: string;
  shipping_etc?: string | null;
  shipping_type: "A" | "C" | "B";
  shipping_place?: string;
  shipping_start_date?: number;
  shipping_end_date?: number;
  shipping_fee_type: "T" | "R" | "M" | "D" | "W" | "C" | "N";
  free_shipping_price?: string | null;
  shipping_fee?: string | null;
  shipping_fee_by_quantity?: string | null;
  shipping_rates?: ShippingRate[];
  prepaid_shipping_fee: "C" | "P" | "B";
  shipping_fee_by_product: "T" | "F";
  product_weight?: string;
  hscode?: string;
  country_hscode?: CountryHsCode[];
}

export interface ShippingSupplierResponse {
  supplier: ShippingSupplier;
}
