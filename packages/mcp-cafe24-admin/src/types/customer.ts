export interface Point {
  point_id: string; // ID might be string or number? usually string check code
  member_id: string;
  member_name: string;
  point_type: string;
  point: number;
  point_date: string;
}

export interface User {
  member_id: string;
  user_id: string;
  user_name: string;
  email: string;
  status: string;
  group: string;
}

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

export interface DormantAccount {
  shop_no?: number;
  use: string;
  notice_send_automatic: string;
  send_sms: string;
  send_email: string;
  point_extinction: string;
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

export interface Policy {
  shop_no?: number;
  privacy_all?: string;
  terms_using_mall?: string;
  use_privacy_join?: string;
  privacy_join?: string;
  use_withdrawal?: string;
  required_withdrawal?: string;
  withdrawal?: string;
}

export interface CustomerPrivacy {
  shop_no: number;
  member_id: string;
  group_no: number;
  member_authentication: "T" | "F" | "B" | "J";
  use_blacklist: "T" | "F";
  blacklist_type: "P" | "L" | "A" | "" | "F";
  authentication_method: "i" | "m" | "e" | "d" | "a" | null;
  sms: "T" | "F";
  news_mail: "T" | "F" | "D";
  solar_calendar: "T" | "F";
  total_points: string;
  available_points: string;
  used_points: string;
  last_login_date: string;
  created_date: string;
  gender: "M" | "F";
  use_mobile_app: "T" | "F";
  available_credits: string;
  fixed_group: "T" | "F";
}

export type CustomerPrivacyResponse = {
  customers: CustomerPrivacy[];
};

export interface CustomerPrivacyParams {
  shop_no?: number;
  member_id?: string;
  cellphone?: string;
}

export interface CustomerAutoUpdate {
  shop_no: number;
  member_id: string;
  next_grade: string | null;
  total_purchase_amount: number;
  total_purchase_count: number;
  required_purchase_amount: number;
  required_purchase_count: number;
}

export type CustomerAutoUpdateResponse = {
  autoupdate: CustomerAutoUpdate;
};

export interface CustomerAutoUpdateParams {
  shop_no?: number;
  member_id: string;
}

export interface CustomerWishlistItem {
  shop_no: number;
  wishlist_no: number;
  product_no: number;
  variant_code: string;
  additional_option: Array<{
    option_name: string;
    option_value: string;
  }> | null;
  attached_file_option: Array<{
    file_path: string;
  }> | null;
  price: string;
  product_bundle: string;
  created_date: string;
  price_content: string | null;
}

export interface CustomerWishlistResponse extends Record<string, unknown> {
  wishlist: CustomerWishlistItem[];
}

export interface CustomerWishlistCountResponse extends Record<string, unknown> {
  count: number;
}

export interface CustomersPrivacyDetailParams {
  member_id: string;
  shop_no?: number;
}

export interface CustomerPrivacyItem {
  shop_no: number;
  member_id: string;
  name: string;
  name_english: string;
  name_phonetic: string;
  phone: string;
  cellphone: string;
  email: string;
  wedding_anniversary: string | null;
  birthday: string | null;
  solar_calendar: "T" | "F";
  total_points: string;
  available_points: string;
  used_points: string;
  available_credits: string;
  city: string;
  state: string;
  address1: string;
  address2: string;
  group_no: number;
  job: string;
  job_class: string;
  zipcode: string;
  created_date: string;
  member_authentication: "T" | "F" | "B" | "J";
  use_blacklist: "T" | "F";
  blacklist_type: "P" | "L" | "A" | "";
  last_login_date: string;
  member_authority: "C" | "P" | "A" | "S";
  nick_name: string;
  recommend_id: string;
  residence: string;
  interest: string;
  gender: "M" | "F";
  member_type: "P" | "C" | "F" | "p" | "c" | "f";
  company_type: "p" | "c" | null;
  foreigner_type: "F" | "P" | "D" | "f" | "p" | "d" | null;
  authentication_method: "i" | "m" | "e" | "d" | "a" | null;
  lifetime_member: "T" | "F";
  corporate_name: string;
  nationality: string;
  shop_name: string;
  country_code: string;
  use_mobile_app: "T" | "F";
  join_path: "P" | "M";
  fixed_group: "T" | "F";
  thirdparty_agree: "T" | "F";
  refund_bank_code: string | null;
  refund_bank_account_no: string | null;
  refund_bank_account_holder: string | null;
  company_condition: string | null;
  company_line: string | null;
  sns_list: string[];
  account_reactivation_date: string | null;
  additional_information: Array<{ key: string; value: string }> | null;
}

export interface CustomersPrivacyResponse extends Record<string, unknown> {
  customersprivacy: CustomerPrivacyItem[];
}

export interface CustomerPrivacyDetailResponse extends Record<string, unknown> {
  customersprivacy: CustomerPrivacyItem;
}

export interface CustomersPrivacyCountResponse extends Record<string, unknown> {
  count: number;
}

export interface CustomerWishlistParams {
  member_id: string;
  shop_no?: number;
}
