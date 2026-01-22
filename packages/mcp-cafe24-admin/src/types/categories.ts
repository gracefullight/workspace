export interface CategoryNameMap {
  [depth: string]: string | null;
}

export interface CategoryNoMap {
  [depth: string]: string | null;
}

export type CategoryDisplayType = "A" | "P" | "M" | "F";
export type CategoryBoolean = "T" | "F";
export type CategorySoldoutDisplay = "B" | "N";
export type CategoryProductDisplayScope = "A" | "G";
export type CategoryProductDisplayType = "A" | "U" | "M";
export type CategoryProductDisplayKey = "A" | "R" | "U" | "N" | "P" | "S" | "C" | "L";
export type CategoryProductDisplaySort = "D" | "A";
export type CategoryProductDisplayPeriod = "W" | "1D" | "3D" | "7D" | "15D" | "1M" | "3M" | "6M";
export type CategoryAccessAuthority = "F" | "T" | "G" | "A";

export interface ProductCategory {
  shop_no: number;
  category_no: number;
  category_depth: number;
  parent_category_no: number | null;
  category_name: string;
  display_type: CategoryDisplayType;
  full_category_name?: CategoryNameMap;
  full_category_no?: CategoryNoMap;
  root_category_no?: number;
  use_main?: CategoryBoolean;
  use_display?: CategoryBoolean;
  display_order?: number;
  soldout_product_display?: CategorySoldoutDisplay;
  sub_category_product_display?: CategoryBoolean;
  hashtag_product_display?: CategoryBoolean;
  hash_tags?: string[];
  product_display_scope?: CategoryProductDisplayScope;
  product_display_type?: CategoryProductDisplayType | null;
  product_display_key?: CategoryProductDisplayKey | null;
  product_display_sort?: CategoryProductDisplaySort | null;
  product_display_period?: CategoryProductDisplayPeriod | null;
  normal_product_display_type?: CategoryProductDisplayType | null;
  normal_product_display_key?: CategoryProductDisplayKey | null;
  normal_product_display_sort?: CategoryProductDisplaySort | null;
  normal_product_display_period?: CategoryProductDisplayPeriod | null;
  recommend_product_display_type?: CategoryProductDisplayType | null;
  recommend_product_display_key?: CategoryProductDisplayKey | null;
  recommend_product_display_sort?: CategoryProductDisplaySort | null;
  recommend_product_display_period?: CategoryProductDisplayPeriod | null;
  new_product_display_type?: CategoryProductDisplayType | null;
  new_product_display_key?: CategoryProductDisplayKey | null;
  new_product_display_sort?: CategoryProductDisplaySort | null;
  new_product_display_period?: CategoryProductDisplayPeriod | null;
  access_authority?: CategoryAccessAuthority;
}

export interface CategoriesListResponse {
  categories: ProductCategory[];
  total?: number;
}

export interface CategoryResponse {
  category: ProductCategory;
}

export interface CategoryDeleteResponse {
  category: {
    category_no: number;
  };
}

export interface CategoriesCountResponse {
  count: number;
}
