import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleApiError, makeApiRequest } from "../services/api-client.js";
import type { Category, Product } from "../types.js";

const ProductsSearchParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    embed: z
      .array(
        z.enum([
          "channeldiscountprices",
          "discountprice",
          "decorationimages",
          "benefits",
          "options",
          "variants",
          "additionalimages",
          "hits",
        ]),
      )
      .optional()
      .describe("Embed resources (options, variants, hits, etc.)"),
    product_no: z.string().optional().describe("Product number(s), comma-separated"),
    product_code: z.string().optional().describe("Product code(s), comma-separated"),
    custom_product_code: z.string().optional().describe("Custom product code(s), comma-separated"),
    custom_variant_code: z.string().optional().describe("Custom variant code(s), comma-separated"),
    product_name: z.string().optional().describe("Product name search (case-insensitive)"),
    eng_product_name: z.string().optional().describe("English product name search"),
    supply_product_name: z.string().optional().describe("Supplier product name search"),
    internal_product_name: z.string().optional().describe("Internal product name search"),
    model_name: z.string().optional().describe("Model name search"),
    product_tag: z.string().optional().describe("Product tag search, comma-separated"),
    brand_code: z.string().optional().describe("Brand code(s), comma-separated"),
    manufacturer_code: z.string().optional().describe("Manufacturer code(s), comma-separated"),
    supplier_code: z.string().optional().describe("Supplier code(s), comma-separated"),
    trend_code: z.string().optional().describe("Trend code(s), comma-separated"),
    product_condition: z
      .string()
      .optional()
      .describe(
        "Product condition (N:New, B:Return, R:Stock, U:Used, E:Display, F:Refurb, S:Scratch)",
      ),
    display: z.enum(["T", "F"]).optional().describe("Display status (T: displayed, F: hidden)"),
    selling: z.enum(["T", "F"]).optional().describe("Selling status (T: selling, F: not selling)"),
    product_bundle: z.enum(["T", "F"]).optional().describe("Bundle product (T: yes, F: no)"),
    option_type: z
      .string()
      .optional()
      .describe("Option type (C: Combined, S: Separated, E: Linked, F: Independent)"),
    price_min: z.number().optional().describe("Minimum price filter"),
    price_max: z.number().optional().describe("Maximum price filter"),
    retail_price_min: z.number().min(0).max(2147483647).optional().describe("Minimum retail price"),
    retail_price_max: z.number().min(0).max(2147483647).optional().describe("Maximum retail price"),
    supply_price_min: z.number().optional().describe("Minimum supply price"),
    supply_price_max: z.number().optional().describe("Maximum supply price"),
    stock_quantity_min: z.number().optional().describe("Minimum stock quantity"),
    stock_quantity_max: z.number().optional().describe("Maximum stock quantity"),
    stock_safety_min: z.number().optional().describe("Minimum safety stock"),
    stock_safety_max: z.number().optional().describe("Maximum safety stock"),
    product_weight: z.string().optional().describe("Product weight(s), comma-separated"),
    created_start_date: z.string().optional().describe("Created date start (YYYY-MM-DD)"),
    created_end_date: z.string().optional().describe("Created date end (YYYY-MM-DD)"),
    updated_start_date: z.string().optional().describe("Updated date start (YYYY-MM-DD)"),
    updated_end_date: z.string().optional().describe("Updated date end (YYYY-MM-DD)"),
    category: z.number().optional().describe("Category number filter"),
    classification_code: z.string().optional().describe("Classification code(s), comma-separated"),
    use_inventory: z.enum(["T", "F"]).optional().describe("Use inventory (T: yes, F: no)"),
    category_unapplied: z.enum(["T"]).optional().describe("Search uncategorized products"),
    include_sub_category: z.enum(["T"]).optional().describe("Include sub-categories"),
    additional_information_key: z.string().optional().describe("Additional info search key"),
    additional_information_value: z.string().optional().describe("Additional info search value"),
    approve_status: z
      .enum(["N", "E", "C", "R", "I"])
      .optional()
      .describe("Approval status (N:New, E:Edit, C:Approved, R:Rejected, I:Inspecting)"),
    origin_place_value: z.string().optional().describe("Origin place value, comma-separated"),
    market_sync: z.enum(["T", "F"]).optional().describe("Market sync (T: yes, F: no)"),
    since_product_no: z
      .number()
      .min(0)
      .max(2147483647)
      .optional()
      .describe("Search products after this product_no"),
    sort: z
      .enum(["created_date", "updated_date", "product_name"])
      .optional()
      .describe("Sort field"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    offset: z.number().int().min(0).max(5000).default(0).describe("Result offset (max 5000)"),
    limit: z.number().int().min(1).max(100).default(10).describe("Result limit (1-100)"),
  })
  .strict();

const ProductCountParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.string().optional().describe("Product number(s), comma-separated"),
    product_code: z.string().optional().describe("Product code(s), comma-separated"),
    custom_product_code: z.string().optional().describe("Custom product code(s), comma-separated"),
    custom_variant_code: z.string().optional().describe("Custom variant code(s), comma-separated"),
    product_name: z.string().optional().describe("Product name search (case-insensitive)"),
    eng_product_name: z.string().optional().describe("English product name search"),
    supply_product_name: z.string().optional().describe("Supplier product name search"),
    internal_product_name: z.string().optional().describe("Internal product name search"),
    model_name: z.string().optional().describe("Model name search"),
    product_tag: z.string().optional().describe("Product tag search, comma-separated"),
    brand_code: z.string().optional().describe("Brand code(s), comma-separated"),
    manufacturer_code: z.string().optional().describe("Manufacturer code(s), comma-separated"),
    supplier_code: z.string().optional().describe("Supplier code(s), comma-separated"),
    trend_code: z.string().optional().describe("Trend code(s), comma-separated"),
    product_condition: z
      .string()
      .optional()
      .describe(
        "Product condition (N:New, B:Return, R:Stock, U:Used, E:Display, F:Refurb, S:Scratch)",
      ),
    display: z.enum(["T", "F"]).optional().describe("Display status (T: displayed, F: hidden)"),
    selling: z.enum(["T", "F"]).optional().describe("Selling status (T: selling, F: not selling)"),
    product_bundle: z.enum(["T", "F"]).optional().describe("Bundle product (T: yes, F: no)"),
    option_type: z
      .string()
      .optional()
      .describe("Option type (C: Combined, S: Separated, E: Linked, F: Independent)"),
    price_min: z.number().optional().describe("Minimum price filter"),
    price_max: z.number().optional().describe("Maximum price filter"),
    retail_price_min: z.number().min(0).max(2147483647).optional().describe("Minimum retail price"),
    retail_price_max: z.number().min(0).max(2147483647).optional().describe("Maximum retail price"),
    supply_price_min: z.number().optional().describe("Minimum supply price"),
    supply_price_max: z.number().optional().describe("Maximum supply price"),
    stock_quantity_min: z.number().optional().describe("Minimum stock quantity"),
    stock_quantity_max: z.number().optional().describe("Maximum stock quantity"),
    stock_safety_min: z.number().optional().describe("Minimum safety stock"),
    stock_safety_max: z.number().optional().describe("Maximum safety stock"),
    product_weight: z.string().optional().describe("Product weight(s), comma-separated"),
    created_start_date: z.string().optional().describe("Created date start (YYYY-MM-DD)"),
    created_end_date: z.string().optional().describe("Created date end (YYYY-MM-DD)"),
    updated_start_date: z.string().optional().describe("Updated date start (YYYY-MM-DD)"),
    updated_end_date: z.string().optional().describe("Updated date end (YYYY-MM-DD)"),
    category: z.number().optional().describe("Category number filter"),
    classification_code: z.string().optional().describe("Classification code(s), comma-separated"),
    use_inventory: z.enum(["T", "F"]).optional().describe("Use inventory (T: yes, F: no)"),
    category_unapplied: z.enum(["T"]).optional().describe("Search uncategorized products"),
    include_sub_category: z.enum(["T"]).optional().describe("Include sub-categories"),
    additional_information_key: z.string().optional().describe("Additional info search key"),
    additional_information_value: z.string().optional().describe("Additional info search value"),
    approve_status: z
      .enum(["N", "E", "C", "R", "I"])
      .optional()
      .describe("Approval status (N:New, E:Edit, C:Approved, R:Rejected, I:Inspecting)"),
    origin_place_value: z.string().optional().describe("Origin place value, comma-separated"),
    market_sync: z.enum(["T", "F"]).optional().describe("Market sync (T: yes, F: no)"),
    since_product_no: z
      .number()
      .min(0)
      .max(2147483647)
      .optional()
      .describe("Search products after this product_no"),
  })
  .strict();

const ProductDetailParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number"),
    embed: z
      .array(
        z.enum([
          "variants",
          "memos",
          "hits",
          "seo",
          "tags",
          "options",
          "discountprice",
          "decorationimages",
          "benefits",
          "additionalimages",
          "custom_properties",
        ]),
      )
      .optional()
      .describe("Embed resources (variants, options, hits, memos, seo, tags, etc.)"),
  })
  .strict();

async function cafe24_count_products(params: z.infer<typeof ProductCountParamsSchema>) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const apiQueryParams: Record<string, unknown> = {};

    if (queryParams.product_no) apiQueryParams.product_no = queryParams.product_no;
    if (queryParams.product_code) apiQueryParams.product_code = queryParams.product_code;
    if (queryParams.custom_product_code)
      apiQueryParams.custom_product_code = queryParams.custom_product_code;
    if (queryParams.custom_variant_code)
      apiQueryParams.custom_variant_code = queryParams.custom_variant_code;
    if (queryParams.product_name) apiQueryParams.product_name = queryParams.product_name;
    if (queryParams.eng_product_name)
      apiQueryParams.eng_product_name = queryParams.eng_product_name;
    if (queryParams.supply_product_name)
      apiQueryParams.supply_product_name = queryParams.supply_product_name;
    if (queryParams.internal_product_name)
      apiQueryParams.internal_product_name = queryParams.internal_product_name;
    if (queryParams.model_name) apiQueryParams.model_name = queryParams.model_name;
    if (queryParams.product_tag) apiQueryParams.product_tag = queryParams.product_tag;
    if (queryParams.brand_code) apiQueryParams.brand_code = queryParams.brand_code;
    if (queryParams.manufacturer_code)
      apiQueryParams.manufacturer_code = queryParams.manufacturer_code;
    if (queryParams.supplier_code) apiQueryParams.supplier_code = queryParams.supplier_code;
    if (queryParams.trend_code) apiQueryParams.trend_code = queryParams.trend_code;
    if (queryParams.product_condition)
      apiQueryParams.product_condition = queryParams.product_condition;
    if (queryParams.display) apiQueryParams.display = queryParams.display;
    if (queryParams.selling) apiQueryParams.selling = queryParams.selling;
    if (queryParams.product_bundle) apiQueryParams.product_bundle = queryParams.product_bundle;
    if (queryParams.option_type) apiQueryParams.option_type = queryParams.option_type;
    if (queryParams.price_min !== undefined) apiQueryParams.price_min = queryParams.price_min;
    if (queryParams.price_max !== undefined) apiQueryParams.price_max = queryParams.price_max;
    if (queryParams.retail_price_min !== undefined)
      apiQueryParams.retail_price_min = queryParams.retail_price_min;
    if (queryParams.retail_price_max !== undefined)
      apiQueryParams.retail_price_max = queryParams.retail_price_max;
    if (queryParams.supply_price_min !== undefined)
      apiQueryParams.supply_price_min = queryParams.supply_price_min;
    if (queryParams.supply_price_max !== undefined)
      apiQueryParams.supply_price_max = queryParams.supply_price_max;
    if (queryParams.stock_quantity_min !== undefined)
      apiQueryParams.stock_quantity_min = queryParams.stock_quantity_min;
    if (queryParams.stock_quantity_max !== undefined)
      apiQueryParams.stock_quantity_max = queryParams.stock_quantity_max;
    if (queryParams.stock_safety_min !== undefined)
      apiQueryParams.stock_safety_min = queryParams.stock_safety_min;
    if (queryParams.stock_safety_max !== undefined)
      apiQueryParams.stock_safety_max = queryParams.stock_safety_max;
    if (queryParams.product_weight) apiQueryParams.product_weight = queryParams.product_weight;
    if (queryParams.created_start_date)
      apiQueryParams.created_start_date = queryParams.created_start_date;
    if (queryParams.created_end_date)
      apiQueryParams.created_end_date = queryParams.created_end_date;
    if (queryParams.updated_start_date)
      apiQueryParams.updated_start_date = queryParams.updated_start_date;
    if (queryParams.updated_end_date)
      apiQueryParams.updated_end_date = queryParams.updated_end_date;
    if (queryParams.category !== undefined) apiQueryParams.category = queryParams.category;
    if (queryParams.classification_code)
      apiQueryParams.classification_code = queryParams.classification_code;
    if (queryParams.use_inventory) apiQueryParams.use_inventory = queryParams.use_inventory;
    if (queryParams.category_unapplied)
      apiQueryParams.category_unapplied = queryParams.category_unapplied;
    if (queryParams.include_sub_category)
      apiQueryParams.include_sub_category = queryParams.include_sub_category;
    if (queryParams.additional_information_key)
      apiQueryParams.additional_information_key = queryParams.additional_information_key;
    if (queryParams.additional_information_value)
      apiQueryParams.additional_information_value = queryParams.additional_information_value;
    if (queryParams.approve_status) apiQueryParams.approve_status = queryParams.approve_status;
    if (queryParams.origin_place_value)
      apiQueryParams.origin_place_value = queryParams.origin_place_value;
    if (queryParams.market_sync) apiQueryParams.market_sync = queryParams.market_sync;
    if (queryParams.since_product_no !== undefined)
      apiQueryParams.since_product_no = queryParams.since_product_no;

    const data = await makeApiRequest<{ count: number }>(
      "/admin/products/count",
      "GET",
      undefined,
      apiQueryParams,
      requestHeaders,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${data.count} products`,
        },
      ],
      structuredContent: { count: data.count },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const ProductCategorySchema = z.object({
  category_no: z.number().describe("Category number"),
  category_name: z.string().describe("Category name"),
});

const ProductCreateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number"),
    supply_price: z.number().min(0).max(2147483647).optional().describe("Supply price"),
    add_category_no: z.array(ProductCategorySchema).optional().describe("Categories to add"),
  })
  .strict();

const ProductUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    supply_price: z.number().min(0).max(2147483647).optional().describe("Supply price"),
    add_category_no: z.array(ProductCategorySchema).optional().describe("Categories to add"),
    delete_category_no: z.array(z.number().int()).optional().describe("Category numbers to delete"),
    translated_additional_description: z
      .string()
      .optional()
      .describe("Translated additional description"),
    use_icon_exposure_term: z.enum(["T", "F"]).optional().describe("Use icon exposure term"),
    icon_exposure_begin_datetime: z.string().optional().describe("Icon exposure start datetime"),
    icon_exposure_end_datetime: z.string().optional().describe("Icon exposure end datetime"),
  })
  .strict();

async function cafe24_list_products(params: z.infer<typeof ProductsSearchParamsSchema>) {
  try {
    const { shop_no, ...queryParams } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const apiQueryParams: Record<string, unknown> = {};

    if (queryParams.embed?.length) apiQueryParams.embed = queryParams.embed.join(",");
    if (queryParams.product_no) apiQueryParams.product_no = queryParams.product_no;
    if (queryParams.product_code) apiQueryParams.product_code = queryParams.product_code;
    if (queryParams.custom_product_code)
      apiQueryParams.custom_product_code = queryParams.custom_product_code;
    if (queryParams.custom_variant_code)
      apiQueryParams.custom_variant_code = queryParams.custom_variant_code;
    if (queryParams.product_name) apiQueryParams.product_name = queryParams.product_name;
    if (queryParams.eng_product_name)
      apiQueryParams.eng_product_name = queryParams.eng_product_name;
    if (queryParams.supply_product_name)
      apiQueryParams.supply_product_name = queryParams.supply_product_name;
    if (queryParams.internal_product_name)
      apiQueryParams.internal_product_name = queryParams.internal_product_name;
    if (queryParams.model_name) apiQueryParams.model_name = queryParams.model_name;
    if (queryParams.product_tag) apiQueryParams.product_tag = queryParams.product_tag;
    if (queryParams.brand_code) apiQueryParams.brand_code = queryParams.brand_code;
    if (queryParams.manufacturer_code)
      apiQueryParams.manufacturer_code = queryParams.manufacturer_code;
    if (queryParams.supplier_code) apiQueryParams.supplier_code = queryParams.supplier_code;
    if (queryParams.trend_code) apiQueryParams.trend_code = queryParams.trend_code;
    if (queryParams.product_condition)
      apiQueryParams.product_condition = queryParams.product_condition;
    if (queryParams.display) apiQueryParams.display = queryParams.display;
    if (queryParams.selling) apiQueryParams.selling = queryParams.selling;
    if (queryParams.product_bundle) apiQueryParams.product_bundle = queryParams.product_bundle;
    if (queryParams.option_type) apiQueryParams.option_type = queryParams.option_type;
    if (queryParams.price_min !== undefined) apiQueryParams.price_min = queryParams.price_min;
    if (queryParams.price_max !== undefined) apiQueryParams.price_max = queryParams.price_max;
    if (queryParams.retail_price_min !== undefined)
      apiQueryParams.retail_price_min = queryParams.retail_price_min;
    if (queryParams.retail_price_max !== undefined)
      apiQueryParams.retail_price_max = queryParams.retail_price_max;
    if (queryParams.supply_price_min !== undefined)
      apiQueryParams.supply_price_min = queryParams.supply_price_min;
    if (queryParams.supply_price_max !== undefined)
      apiQueryParams.supply_price_max = queryParams.supply_price_max;
    if (queryParams.stock_quantity_min !== undefined)
      apiQueryParams.stock_quantity_min = queryParams.stock_quantity_min;
    if (queryParams.stock_quantity_max !== undefined)
      apiQueryParams.stock_quantity_max = queryParams.stock_quantity_max;
    if (queryParams.stock_safety_min !== undefined)
      apiQueryParams.stock_safety_min = queryParams.stock_safety_min;
    if (queryParams.stock_safety_max !== undefined)
      apiQueryParams.stock_safety_max = queryParams.stock_safety_max;
    if (queryParams.product_weight) apiQueryParams.product_weight = queryParams.product_weight;
    if (queryParams.created_start_date)
      apiQueryParams.created_start_date = queryParams.created_start_date;
    if (queryParams.created_end_date)
      apiQueryParams.created_end_date = queryParams.created_end_date;
    if (queryParams.updated_start_date)
      apiQueryParams.updated_start_date = queryParams.updated_start_date;
    if (queryParams.updated_end_date)
      apiQueryParams.updated_end_date = queryParams.updated_end_date;
    if (queryParams.category !== undefined) apiQueryParams.category = queryParams.category;
    if (queryParams.classification_code)
      apiQueryParams.classification_code = queryParams.classification_code;
    if (queryParams.use_inventory) apiQueryParams.use_inventory = queryParams.use_inventory;
    if (queryParams.category_unapplied)
      apiQueryParams.category_unapplied = queryParams.category_unapplied;
    if (queryParams.include_sub_category)
      apiQueryParams.include_sub_category = queryParams.include_sub_category;
    if (queryParams.additional_information_key)
      apiQueryParams.additional_information_key = queryParams.additional_information_key;
    if (queryParams.additional_information_value)
      apiQueryParams.additional_information_value = queryParams.additional_information_value;
    if (queryParams.approve_status) apiQueryParams.approve_status = queryParams.approve_status;
    if (queryParams.origin_place_value)
      apiQueryParams.origin_place_value = queryParams.origin_place_value;
    if (queryParams.market_sync) apiQueryParams.market_sync = queryParams.market_sync;
    if (queryParams.since_product_no !== undefined)
      apiQueryParams.since_product_no = queryParams.since_product_no;
    if (queryParams.sort) apiQueryParams.sort = queryParams.sort;
    if (queryParams.order) apiQueryParams.order = queryParams.order;

    const data = await makeApiRequest<{ products: Product[]; total: number }>(
      "/admin/products",
      "GET",
      undefined,
      apiQueryParams,
      requestHeaders,
    );
    const products = data.products || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} products (showing ${products.length})\n\n` +
            products
              .map(
                (p: Product) =>
                  `## ${p.product_name} (${p.product_no})\n` +
                  `- **Code**: ${p.product_code}\n` +
                  `- **Price**: ${p.price}\n` +
                  `- **Display**: ${p.display === "T" ? "Yes" : "No"}\n` +
                  `- **Selling**: ${p.selling === "T" ? "Yes" : "No"}\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        count: products.length,
        offset: params.offset,
        products,
        has_more: products.length === params.limit,
        ...(products.length === params.limit
          ? { next_offset: params.offset + products.length }
          : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_get_product(params: z.infer<typeof ProductDetailParamsSchema>) {
  try {
    const { shop_no, product_no, embed } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const queryParams: Record<string, unknown> = {};
    if (embed?.length) queryParams.embed = embed.join(",");

    const data = await makeApiRequest<{ product: Product }>(
      `/admin/products/${product_no}`,
      "GET",
      undefined,
      queryParams,
      requestHeaders,
    );
    const product = (data.product || {}) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Product Details\n\n` +
            `- **Product No**: ${product.product_no}\n` +
            `- **Name**: ${product.product_name}\n` +
            `- **Code**: ${product.product_code}\n` +
            `- **Price**: ${product.price}\n` +
            `- **Retail Price**: ${product.retail_price}\n` +
            `- **Supply Price**: ${product.supply_price}\n` +
            `- **Display**: ${product.display === "T" ? "Yes" : "No"}\n` +
            `- **Selling**: ${product.selling === "T" ? "Yes" : "No"}\n` +
            `- **Sold Out**: ${product.sold_out === "T" ? "Yes" : "No"}\n`,
        },
      ],
      structuredContent: product,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_product(params: z.infer<typeof ProductCreateParamsSchema>) {
  try {
    const { shop_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest<{ product: Product }>(
      "/admin/products",
      "POST",
      payload,
      undefined,
      requestHeaders,
    );
    const product = (data.product || {}) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Product created: ${product.product_name} (No: ${product.product_no}, Code: ${product.product_code})`,
        },
      ],
      structuredContent: product,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product(params: z.infer<typeof ProductUpdateParamsSchema>) {
  try {
    const { shop_no, product_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest<{ product: Product }>(
      `/admin/products/${product_no}`,
      "PUT",
      payload,
      undefined,
      requestHeaders,
    );
    const product = (data.product || {}) as unknown as Record<string, unknown>;

    return {
      content: [
        {
          type: "text" as const,
          text: `Product updated: ${product.product_name} (No: ${product.product_no})`,
        },
      ],
      structuredContent: product,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const ProductDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().describe("Multi-shop number (default: 1)"),
    product_no: z.number().describe("Product number (required)"),
  })
  .strict();

async function cafe24_delete_product(params: z.infer<typeof ProductDeleteParamsSchema>) {
  try {
    const { shop_no, product_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{ product: { product_no: number } }>(
      `/admin/products/${product_no}`,
      "DELETE",
      undefined,
      undefined,
      requestHeaders,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Product ${data.product?.product_no || product_no} deleted successfully`,
        },
      ],
      structuredContent: { product_no: data.product?.product_no || product_no },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const ProductAdditionalImagesParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    additional_image: z
      .array(z.string())
      .min(1)
      .max(20)
      .describe("Additional images (base64 data URIs, max 20, 5MB each, 30MB total)"),
  })
  .strict();

const ProductAdditionalImagesDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
  })
  .strict();

async function cafe24_create_product_additional_images(
  params: z.infer<typeof ProductAdditionalImagesParamsSchema>,
) {
  try {
    const { shop_no, product_no, additional_image } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: {
        additional_image,
      },
    };

    const data = await makeApiRequest<{
      additionalimage: { shop_no: number; additional_image: Record<string, string>[] };
    }>(
      `/admin/products/${product_no}/additionalimages`,
      "POST",
      payload,
      undefined,
      requestHeaders,
    );

    const result =
      data.additionalimage || ({ additional_image: [] } as { additional_image?: string[] });

    return {
      content: [
        {
          type: "text" as const,
          text: `Added ${result.additional_image?.length || 0} additional images to product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_additional_images(
  params: z.infer<typeof ProductAdditionalImagesParamsSchema>,
) {
  try {
    const { shop_no, product_no, additional_image } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: {
        additional_image,
      },
    };

    const data = await makeApiRequest<{
      additionalimage: { shop_no: number; additional_image: Record<string, string>[] };
    }>(`/admin/products/${product_no}/additionalimages`, "PUT", payload, undefined, requestHeaders);

    const result = data.additionalimage || ({} as { additional_image?: string[] });

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated additional images for product ${product_no} (${result.additional_image?.length || 0} images)`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_product_additional_images(
  params: z.infer<typeof ProductAdditionalImagesDeleteParamsSchema>,
) {
  try {
    const { shop_no, product_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      additionalimage: { shop_no: number; product_no: number };
    }>(
      `/admin/products/${product_no}/additionalimages`,
      "DELETE",
      undefined,
      { shop_no },
      requestHeaders,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Deleted all additional images from product ${data.additionalimage?.product_no || product_no}`,
        },
      ],
      structuredContent: data.additionalimage as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const ProductApproveGetParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
  })
  .strict();

const ProductApproveRequestParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    user_id: z.string().describe("Supplier operator ID (required)"),
  })
  .strict();

const ProductApproveUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    user_id: z.string().describe("Supplier operator ID (required)"),
    status: z
      .enum(["C", "R", "I"])
      .describe("Approval status (C: Approved, R: Rejected, I: Inspecting)"),
  })
  .strict();

const statusMap: Record<string, string> = {
  N: "Approval Request (New)",
  E: "Approval Request (Edit)",
  C: "Approved",
  R: "Rejected",
  I: "Inspecting",
  "": "Never requested",
};

async function cafe24_get_product_approve(params: z.infer<typeof ProductApproveGetParamsSchema>) {
  try {
    const { shop_no, product_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      approve: { shop_no: number; status: string; product_no: number };
    }>(`/admin/products/${product_no}/approve`, "GET", undefined, { shop_no }, requestHeaders);

    const result =
      data.approve || ({} as { shop_no?: number; status?: string; product_no?: number });

    return {
      content: [
        {
          type: "text" as const,
          text: `Product ${result.product_no} approval status: ${statusMap[result.status] || result.status}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_request_product_approve(
  params: z.infer<typeof ProductApproveRequestParamsSchema>,
) {
  try {
    const { shop_no, product_no, user_id } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: { user_id },
    };

    const data = await makeApiRequest<{
      approve: { shop_no: number; status: string; product_no: number };
    }>(`/admin/products/${product_no}/approve`, "POST", payload, undefined, requestHeaders);

    const result =
      data.approve || ({} as { shop_no?: number; status?: string; product_no?: number });

    return {
      content: [
        {
          type: "text" as const,
          text: `Approval requested for product ${result.product_no} (status: ${result.status})`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_approve(
  params: z.infer<typeof ProductApproveUpdateParamsSchema>,
) {
  try {
    const { shop_no, product_no, user_id, status } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: { user_id, status },
    };

    const data = await makeApiRequest<{
      approve: { shop_no: number; status: string; product_no: number };
    }>(`/admin/products/${product_no}/approve`, "PUT", payload, undefined, requestHeaders);

    const result =
      data.approve || ({} as { shop_no?: number; status?: string; product_no?: number });
    const statusMap: Record<string, string> = {
      C: "Approved",
      R: "Rejected",
      I: "Inspecting",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `Product ${result.product_no} approval updated: ${statusMap[result.status] || result.status}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const ProductCustomPropertiesGetParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
  })
  .strict();

const ProductCustomPropertiesUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    property_no: z.number().describe("Custom property number (required)"),
    property_value: z.string().optional().describe("Custom property value"),
  })
  .strict();

const ProductCustomPropertiesDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    property_no: z.number().describe("Custom property number (required)"),
  })
  .strict();

async function cafe24_get_product_custom_properties(
  params: z.infer<typeof ProductCustomPropertiesGetParamsSchema>,
) {
  try {
    const { shop_no, product_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      products: {
        shop_no: number;
        custom_properties: { property_no: number; property_name: string; property_value: string }[];
      };
    }>(
      `/admin/products/${product_no}/customproperties`,
      "GET",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const result =
      data.products ||
      ({} as {
        custom_properties?: {
          property_no: number;
          property_name: string;
          property_value: string;
        }[];
      });
    const properties = result.custom_properties || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${properties.length} custom properties for product ${product_no}\n\n` +
            properties
              .map((p) => `- [${p.property_no}] ${p.property_name}: ${p.property_value}`)
              .join("\n"),
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_product_custom_property(
  params: z.infer<typeof ProductCustomPropertiesUpdateParamsSchema>,
) {
  try {
    const { shop_no, product_no, property_no, property_value } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: { property_value },
    };

    const data = await makeApiRequest<{
      product: {
        shop_no: number;
        custom_properties: { property_no: number; property_name: string; property_value: string }[];
      };
    }>(
      `/admin/products/${product_no}/customproperties/${property_no}`,
      "PUT",
      payload,
      undefined,
      requestHeaders,
    );

    const result = data.product || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated custom property ${property_no} for product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_product_custom_property(
  params: z.infer<typeof ProductCustomPropertiesDeleteParamsSchema>,
) {
  try {
    const { shop_no, product_no, property_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      product: {
        shop_no: number;
        custom_properties: { property_no: number; property_name: string; property_value: string }[];
      };
    }>(
      `/admin/products/${product_no}/customproperties/${property_no}`,
      "DELETE",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const result = data.product || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Deleted custom property ${property_no} from product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const DecorationImageSchema = z.object({
  code: z.string().describe("Decoration image code"),
  path: z.string().optional().describe("Decoration image path"),
  image_horizontal_position: z
    .enum(["L", "C", "R"])
    .optional()
    .describe("Horizontal position (L: Left, C: Center, R: Right)"),
  image_vertical_position: z
    .enum(["T", "C", "B"])
    .optional()
    .describe("Vertical position (T: Top, C: Center, B: Bottom)"),
});

const DecorationImagesGetParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
  })
  .strict();

const DecorationImagesCreateUpdateParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    use_show_date: z.enum(["T", "F"]).optional().describe("Use show date period"),
    show_start_date: z.string().optional().describe("Show start date (ISO format)"),
    show_end_date: z.string().optional().describe("Show end date (ISO format)"),
    image_list: z.array(DecorationImageSchema).min(1).describe("Decoration image list"),
  })
  .strict();

const DecorationImagesDeleteParamsSchema = z
  .object({
    shop_no: z.number().int().min(1).optional().default(1).describe("Multi-shop number"),
    product_no: z.number().describe("Product number (required)"),
    code: z.string().describe("Decoration image code to delete"),
  })
  .strict();

async function cafe24_get_decoration_images(
  params: z.infer<typeof DecorationImagesGetParamsSchema>,
) {
  try {
    const { shop_no, product_no } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      decorationimage: {
        use_show_date: string;
        show_start_date: string;
        show_end_date: string;
        image_list: Record<string, string>[];
      };
    }>(
      `/admin/products/${product_no}/decorationimages`,
      "GET",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const result =
      data.decorationimage ||
      ({} as {
        show_start_date?: string;
        show_end_date: string;
        image_list: Record<string, string>[];
        use_show_date?: string;
      });
    const images = result.image_list || [];

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Decoration images for product ${product_no}\n` +
            `Show date: ${result.use_show_date === "T" ? "Enabled" : "Disabled"}\n` +
            `Period: ${result.show_start_date || "N/A"} ~ ${result.show_end_date || "N/A"}\n\n` +
            images
              .map(
                (img) =>
                  `- Code: ${img.code}, Position: ${img.image_horizontal_position}/${img.image_vertical_position}`,
              )
              .join("\n"),
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_create_decoration_images(
  params: z.infer<typeof DecorationImagesCreateUpdateParamsSchema>,
) {
  try {
    const { shop_no, product_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest<{
      decorationimage: Record<string, unknown>;
    }>(
      `/admin/products/${product_no}/decorationimages`,
      "POST",
      payload,
      undefined,
      requestHeaders,
    );

    const result = data.decorationimage || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Created decoration images for product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_update_decoration_images(
  params: z.infer<typeof DecorationImagesCreateUpdateParamsSchema>,
) {
  try {
    const { shop_no, product_no, ...requestBody } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const payload = {
      shop_no,
      request: requestBody,
    };

    const data = await makeApiRequest<{
      decorationimage: Record<string, unknown>;
    }>(`/admin/products/${product_no}/decorationimages`, "PUT", payload, undefined, requestHeaders);

    const result = data.decorationimage || {};

    return {
      content: [
        {
          type: "text" as const,
          text: `Updated decoration images for product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

async function cafe24_delete_decoration_image(
  params: z.infer<typeof DecorationImagesDeleteParamsSchema>,
) {
  try {
    const { shop_no, product_no, code } = params;
    const requestHeaders = shop_no ? { "X-Cafe24-Shop-No": shop_no.toString() } : undefined;

    const data = await makeApiRequest<{
      decorationimage: { shop_no: number; code: string };
    }>(
      `/admin/products/${product_no}/decorationimages/${code}`,
      "DELETE",
      undefined,
      { shop_no },
      requestHeaders,
    );

    const result = data.decorationimage || ({} as { code?: string });

    return {
      content: [
        {
          type: "text" as const,
          text: `Deleted decoration image ${result.code || code} from product ${product_no}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

const CategoriesSearchParamsSchema = z
  .object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe("Maximum results to return (1-100)"),
    offset: z.number().int().min(0).default(0).describe("Number of results to skip"),
    parent_category_no: z.number().optional().describe("Filter by parent category"),
  })
  .strict();

async function cafe24_list_categories(params: z.infer<typeof CategoriesSearchParamsSchema>) {
  try {
    const data = await makeApiRequest<{ categories: Category[]; total: number }>(
      "/admin/categories",
      "GET",
      undefined,
      {
        limit: params.limit,
        offset: params.offset,
        ...(params.parent_category_no ? { parent_category_no: params.parent_category_no } : {}),
      },
    );

    const categories = data.categories || [];
    const total = data.total || 0;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `Found ${total} categories (showing ${categories.length})\n\n` +
            categories
              .map(
                (c) =>
                  `## ${c.category_name} (${c.category_no})\n- **Depth**: ${c.category_depth}\n- **Parent**: ${c.parent_category_no || "None"}\n`,
              )
              .join(""),
        },
      ],
      structuredContent: {
        total,
        count: categories.length,
        offset: params.offset,
        categories: categories.map((c) => ({
          id: c.category_no.toString(),
          name: c.category_name,
          depth: c.category_depth,
          parent_id: c.parent_category_no?.toString() || null,
        })),
        has_more: total > params.offset + categories.length,
        ...(total > params.offset + categories.length
          ? { next_offset: params.offset + categories.length }
          : {}),
      },
    };
  } catch (error) {
    return { content: [{ type: "text" as const, text: handleApiError(error) }] };
  }
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_list_products",
    {
      title: "List Cafe24 Products",
      description:
        "Retrieve a list of products from Cafe24. Returns product details including product number, name, code, price, stock, and status. Supports extensive filtering by product number, code, category, price range, selling status, and display status. Paginated results.",
      inputSchema: ProductsSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_products,
  );

  server.registerTool(
    "cafe24_count_products",
    {
      title: "Count Cafe24 Products",
      description:
        "Get the count of products matching the specified filters. Supports all product search filters.",
      inputSchema: ProductCountParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_count_products,
  );

  server.registerTool(
    "cafe24_get_product",
    {
      title: "Get Cafe24 Product Details",
      description:
        "Retrieve detailed information about a specific product by product number. Returns complete product details including name, code, price, stock, description, selling status, display status, and dates.",
      inputSchema: ProductDetailParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_product,
  );

  server.registerTool(
    "cafe24_create_product",
    {
      title: "Create Cafe24 Product",
      description:
        "Create a new product in Cafe24. Requires product name and price. Optionally includes product code, stock quantity, descriptions, selling status, and display status.",
      inputSchema: ProductCreateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_product,
  );

  server.registerTool(
    "cafe24_update_product",
    {
      title: "Update Cafe24 Product",
      description:
        "Update an existing product in Cafe24 by product number. Only provided fields will be updated.",
      inputSchema: ProductUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product,
  );

  server.registerTool(
    "cafe24_delete_product",
    {
      title: "Delete Cafe24 Product",
      description: "Delete a product from Cafe24 by product number. This action cannot be undone.",
      inputSchema: ProductDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_delete_product,
  );

  server.registerTool(
    "cafe24_create_product_additional_images",
    {
      title: "Create Product Additional Images",
      description:
        "Add additional images to a product. Max 20 images, 5MB each, 30MB total per request. Images should be base64 data URIs.",
      inputSchema: ProductAdditionalImagesParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_product_additional_images,
  );

  server.registerTool(
    "cafe24_update_product_additional_images",
    {
      title: "Update Product Additional Images",
      description:
        "Replace all additional images for a product. Max 20 images, 5MB each, 30MB total per request. Images should be base64 data URIs.",
      inputSchema: ProductAdditionalImagesParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_additional_images,
  );

  server.registerTool(
    "cafe24_delete_product_additional_images",
    {
      title: "Delete Product Additional Images",
      description: "Delete all additional images from a product.",
      inputSchema: ProductAdditionalImagesDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_delete_product_additional_images,
  );

  server.registerTool(
    "cafe24_get_product_approve",
    {
      title: "Get Product Approval Status",
      description: "Retrieve the approval status of a product.",
      inputSchema: ProductApproveGetParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_product_approve,
  );

  server.registerTool(
    "cafe24_request_product_approve",
    {
      title: "Request Product Approval",
      description: "Request approval for a product from a supplier.",
      inputSchema: ProductApproveRequestParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_request_product_approve,
  );

  server.registerTool(
    "cafe24_update_product_approve",
    {
      title: "Update Product Approval",
      description:
        "Update the approval status of a product (C: Approved, R: Rejected, I: Inspecting).",
      inputSchema: ProductApproveUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_approve,
  );

  server.registerTool(
    "cafe24_get_product_custom_properties",
    {
      title: "Get Product Custom Properties",
      description: "Retrieve custom properties of a product.",
      inputSchema: ProductCustomPropertiesGetParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_product_custom_properties,
  );

  server.registerTool(
    "cafe24_update_product_custom_property",
    {
      title: "Update Product Custom Property",
      description: "Update a custom property value for a product.",
      inputSchema: ProductCustomPropertiesUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_product_custom_property,
  );

  server.registerTool(
    "cafe24_delete_product_custom_property",
    {
      title: "Delete Product Custom Property",
      description: "Delete (clear) a custom property value from a product.",
      inputSchema: ProductCustomPropertiesDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_delete_product_custom_property,
  );

  server.registerTool(
    "cafe24_get_decoration_images",
    {
      title: "Get Product Decoration Images",
      description: "Retrieve decoration images of a product.",
      inputSchema: DecorationImagesGetParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_get_decoration_images,
  );

  server.registerTool(
    "cafe24_create_decoration_images",
    {
      title: "Create Product Decoration Images",
      description: "Add decoration images to a product with position settings.",
      inputSchema: DecorationImagesCreateUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    cafe24_create_decoration_images,
  );

  server.registerTool(
    "cafe24_update_decoration_images",
    {
      title: "Update Product Decoration Images",
      description: "Update decoration images for a product.",
      inputSchema: DecorationImagesCreateUpdateParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_update_decoration_images,
  );

  server.registerTool(
    "cafe24_delete_decoration_image",
    {
      title: "Delete Product Decoration Image",
      description: "Delete a specific decoration image from a product.",
      inputSchema: DecorationImagesDeleteParamsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    cafe24_delete_decoration_image,
  );

  server.registerTool(
    "cafe24_list_categories",
    {
      title: "List Cafe24 Product Categories",
      description:
        "Retrieve a list of product categories from Cafe24. Returns category details including category number, name, depth, and parent category. Supports pagination and filtering by parent category.",
      inputSchema: CategoriesSearchParamsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    cafe24_list_categories,
  );
}
