export interface Main extends Record<string, unknown> {
  shop_no: number;
  module_code: string;
  display_group: number;
  group_name: string;
  soldout_sort_type: "B" | "N";
  use_autodisplay?: "T" | "F";
}

export interface MainResponse {
  main: Main;
}

export interface MainsResponse {
  mains: Main[];
}
