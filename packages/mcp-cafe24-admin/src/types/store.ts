export interface StoreSupplier {
  supplier_no: number;
  supplier_name: string;
}

export interface StoreInformation extends Record<string, unknown> {
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

export interface DisplaySetting extends Record<string, unknown> {
  shop_no?: number;
  strikethrough_retail_price?: string;
  strikethrough_price?: string;
  product_tax_type_text?: TextStyle;
  product_discount_price_text?: TextStyle;
  optimum_discount_price_text?: TextStyle;
}

export interface Store extends Record<string, unknown> {
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

export interface AdminUser extends Record<string, unknown> {
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

export interface Shop extends Record<string, unknown> {
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

export interface SalesStat {
  date: string;
  order_price: string;
  paid_price: string;
  refund_price: string;
  order_count: number;
  payed_count: number;
  refund_count: number;
  shipping_count: number;
  shipped_count: number;
  canceled_count: number;
  returned_count: number;
  exchanged_count: number;
}

export interface SummaryStat {
  ordered_total_price: string;
  ordered_count: number;
  payed_total_price: string;
  payed_count: number;
  refunded_total_price: string;
  refunded_count: number;
}

export interface Dashboard extends Record<string, unknown> {
  shop_no?: number;
  daily_sales_stats?: SalesStat[];
  weekly_sales_stats?: SummaryStat;
  monthly_sales_stats?: SummaryStat;
  board_list?: unknown[];
  sold_out_products_count?: number;
  new_members_count?: number;
}

export interface TaxManagerSetting extends Record<string, unknown> {
  use: string;
}

export interface ShippingManagerStatus extends Record<string, unknown> {
  shop_no?: number;
  use: string;
}

export interface SeoSetting extends Record<string, unknown> {
  shop_no?: number;
  common_page_title?: string;
  common_page_meta_description?: string;
  use_google_search_console?: string;
  use_naver_search_advisor?: string;
  use_sitemap_auto_update?: string;
  use_rss?: string;
  favicon?: string;
  robots_text?: string;
  llms_text?: string;
}

export interface MobileSetting extends Record<string, unknown> {
  shop_no?: number;
  use_mobile_page?: string;
  use_mobile_domain_redirection?: string;
}

export interface PaymentSetting extends Record<string, unknown> {
  shop_no?: number;
  use_escrow?: string;
  use_escrow_account_transfer?: string;
  use_escrow_virtual_account?: string;
  pg_shipping_registration?: string;
  purchase_protection_amount?: number;
  use_direct_pay?: string;
  payment_display_type?: string;
}

export interface CurrencySetting extends Record<string, unknown> {
  shop_no?: number;
  exchange_rate: string;
  standard_currency_code: string;
  standard_currency_symbol: string;
  shop_currency_code: string;
  shop_currency_symbol: string;
  shop_currency_format: string;
}

export interface Redirect extends Record<string, unknown> {
  shop_no: number;
  id: number;
  path: string;
  target: string;
}

export interface CartSetting extends Record<string, unknown> {
  shop_no?: number;
  use_basket_encryption?: string;
  wishlist_display?: string;
  add_action_type?: string;
  cart_item_direct_purchase?: string;
  storage_period?: string;
  period?: number;
  icon_display?: string;
  cart_item_option_change?: string;
  discount_display?: string;
}

export interface Menu extends Record<string, unknown> {
  menu_no: string;
  name: string;
  shop_no: number;
  mode: string;
  path: string;
  contains_app_url: string | boolean; // API likely returns "T"/"F" or string
}
