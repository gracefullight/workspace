// Type definitions for Cafe24 API responses

export interface Cafe24ApiResponse<T> {
  code?: string;
  message?: string;
  // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
  more_info?: Record<string, any>;
  resource?: T;
}

export interface Cafe24Error {
  code: string;
  message: string;
  // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
  more_info?: Record<string, any>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  count: number;
  offset: number;
  items: T[];
  has_more: boolean;
  next_offset?: number;
}

export interface Theme {
  theme_no: number;
  theme_name: string;
}

export interface Supplier {
  supplier_no: number;
  supplier_name: string;
}

export interface DailySales {
  date: string;
  sales_count: number;
  sales_amount: number;
}

export interface Point {
  point_id: string; // ID might be string or number? usually string check code
  member_id: string;
  member_name: string;
  point_type: string;
  point: number;
  point_date: string;
}

export interface BundleProductComponent {
  product_no: number;
  product_name: string;
  purchase_quantity: number;
  product_code?: string;
  product_price?: string;
}

export interface BundleProduct {
  product_no: number;
  product_code: string;
  product_name: string;
  display: string;
  selling: string;
  price_content?: string;
  bundle_product_components?: BundleProductComponent[];
}

export interface Benefit {
  benefit_no: number;
  benefit_name: string;
}

export interface Promotion {
  promotion_no: number;
  promotion_name: string;
}

export interface Coupon {
  coupon_no: string;
  coupon_name: string;
  coupon_type?: string;
  apply_method?: string;
  valid_start_date?: string;
  valid_end_date?: string;
  discount_value?: number;
  issue_limit?: number;
}

export interface Redirect {
  shop_no: number;
  id: number;
  path: string;
  target: string;
}

export interface StoreInformation {
  shop_no?: number;
  type: string;
  display_mobile?: string;
  use?: string;
  content?: string;
  save_type?: string;
}

export interface TextStyle {
  use?: string;
  color?: string;
  font_size?: string | number;
  font_type?: string;
}

export interface DisplaySetting {
  shop_no?: number;
  strikethrough_retail_price?: string;
  strikethrough_price?: string;
  product_tax_type_text?: TextStyle;
  product_discount_price_text?: TextStyle;
  optimum_discount_price_text?: TextStyle;
}

export interface AutomessageArgument {
  shop_no: number;
  name: string;
  description: string;
  sample: string;
  string_length: string;
  send_case: string;
}

export interface AutomessageSetting {
  shop_no?: number;
  use_sms?: string;
  use_kakaoalimtalk?: string;
  use_push?: string;
  send_method?: string;
  send_method_push?: string;
}

export interface Menu {
  menu_no: string;
  name: string;
  shop_no: number;
  mode: string;
  path: string;
  contains_app_url: string | boolean; // API likely returns "T"/"F" or string
}

export interface PrivacyAgreement {
  no: number;
  name: string;
  shop_no?: number;
  use: string;
  required?: string;
  display?: string[];
  content?: string;
  save_type?: string;
  use_member?: string;
  use_non_member?: string;
}

// Store types
export interface Store {
  mall_id: string;
  mall_name: string;
  shop_no: number;
  currency_code: string;
  currency_symbol: string;
  company_name?: string;
  company_registration_no?: string;
  president_name?: string;
  base_domain?: string;
  primary_domain?: string;
  email?: string;
  phone?: string;
  customer_service_phone?: string;
  address1?: string;
  address2?: string;
  sales_product_categories?: string[] | string;
}

export interface AdminUser {
  user_id: string;
  user_name: string;
  email: string;
  phone: string;
  admin_type: string;
  last_login_date?: string;
  ip_restriction_type?: string;
  nick_name?: string;
  available?: string;
  memo?: string;
  multishop_access_authority?: string;
  ip_access_restriction?: {
    usage: string;
  };
  shop_no?: number;
}

export interface StoreAccount {
  bank_name: string;
  bank_code: string;
  bank_account_no: string;
  bank_account_holder: string;
  use_account: string;
}

export interface Shop {
  shop_no: number;
  shop_name: string;
  currency_code: string;
  locale_code: string;
  default?: string;
  active?: string;
  primary_domain?: string;
  language_name?: string;
  language_code?: string;
  currency_name?: string;
  is_https_active?: string;
  base_domain?: string;
  slave_domain?: string[];
  business_country_code?: string;
  timezone_name?: string;
  timezone?: string;
  date_format?: string;
  pc_skin_no?: number;
  mobile_skin_no?: number;
  site_connect?: string;
  use_translation?: string;
}

export interface User {
  member_id: string;
  user_id: string;
  user_name: string;
  email: string;
  status: string;
  group: string;
}

// Product types
export interface Product {
  product_no: number;
  product_code: string;
  product_name: string;
  product_name_origin: string;
  description?: string;
  summary_description?: string;
  detail_description?: string;
  price: number;
  selling: boolean | string;
  display: boolean | string;
  stock: number;
  created_date: string;
  updated_date: string;
  selling_date_start?: string;
  selling_date_end?: string;
}

export interface Category {
  category_no: number;
  category_name: string;
  full_category_name: string;
  category_depth: number;
  parent_category_no: number | null;
}

// Order types
export interface Order {
  order_id: string;
  order_name: string;
  order_status_code: string;
  order_status_name: string;
  payment_status: string;
  payment_status_name: string;
  settle_amount: number;
  currency: string;
  order_date: string;
  customer_id: string;
  customer_name: string;
}

export interface OrderStatus {
  status_name_id: number;
  status_type: string;
  basic_name: string;
  custom_name?: string;
  reservation_custom_name?: string;
}

// Customer types
export interface Customer {
  member_id: string;
  member_name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  join_date: string;
  group?: string;
}

export interface CustomerSetting {
  shop_no: number;
  simple_member_join: string;
  member_authentication: string;
  minimum_age_restriction: string;
  adult_age_restriction: string;
  adult_purchase_restriction: string;
  adult_image_restriction: string;
  gender_restriction: string;
  member_rejoin_restriction: string;
  member_rejoin_restriction_day: number;
  password_authentication: string;
  member_join_confirmation: string;
  email_duplication: string;
  password_recovery: string;
  link_social_account: string;
  save_member_id: string;
  unregistration_admin_approval: string;
  unregistration_reason: string;
  display_group: string;
  join_standard: string;
  use_update_birthday: string;
}

// Board types
export interface Board {
  board_no: number;
  board_name: string;
  board_type: string;
  display: boolean;
  use: boolean;
}

export interface Article {
  article_no: number;
  board_no: number;
  subject: string;
  writer_name: string;
  writer_id: string;
  content: string;
  read_count: number;
  comment_count: number;
  write_date: string;
}

export interface MainProduct {
  shop_no: number;
  product_no: number;
  product_name: string;
  fixed_sort: boolean;
}

export interface MainProductOperationResult {
  shop_no: number;
  product_no: number | number[];
  fix_product_no?: number[];
}
