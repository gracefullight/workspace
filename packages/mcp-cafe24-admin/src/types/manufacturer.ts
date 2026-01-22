export interface Manufacturer extends Record<string, unknown> {
  /**
   * Shop Number
   */
  shop_no: number;
  /**
   * Manufacturer code
   * Unique number of each manufacturer. This number cannot be duplicated in a mall.
   */
  manufacturer_code: string;
  /**
   * Manufacturer name
   * Name of manufacturer. Manufacturer name is the basic information for mall to distinguish each manufacturer.
   */
  manufacturer_name: string;
  /**
   * CEO
   * President name of manufacturer.
   */
  president_name: string;
  /**
   * Email
   */
  email?: string;
  /**
   * Office phone number
   */
  phone?: string;
  /**
   * Home page
   */
  homepage?: string;
  /**
   * Zipcode
   */
  zipcode?: string;
  /**
   * Country code
   */
  country_code?: string;
  /**
   * Address 1
   */
  address1?: string;
  /**
   * Address 2
   */
  address2?: string;
  /**
   * Created date
   */
  created_date?: string;
  /**
   * Use classification
   * Whether use the manufacturer or not.
   * T: Use, F: Do not use
   */
  use_manufacturer: "T" | "F";
}

export interface ListManufacturersResponse {
  manufacturers: Pick<
    Manufacturer,
    "shop_no" | "manufacturer_code" | "manufacturer_name" | "president_name" | "use_manufacturer"
  >[];
}

export interface ManufacturerResponse {
  manufacturer: Manufacturer;
}

export interface ManufacturerCountResponse {
  count: number;
}
