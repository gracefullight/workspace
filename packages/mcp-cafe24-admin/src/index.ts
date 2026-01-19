import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  BoardDetailParamsSchema,
  BoardsSearchParamsSchema,
  cafe24_get_board,
  cafe24_list_boards,
} from "./tools/board.js";
import {
  CustomerDetailParamsSchema,
  CustomersSearchParamsSchema,
  cafe24_get_customer,
  cafe24_list_customers,
} from "./tools/customer.js";
import {
  cafe24_get_daily_sales,
  cafe24_get_points,
  cafe24_list_suppliers,
  cafe24_list_themes,
  MileageSearchParamsSchema,
  SalesSearchParamsSchema,
  SuppliersSearchParamsSchema,
  ThemesSearchParamsSchema,
} from "./tools/misc.js";
import {
  cafe24_get_order,
  cafe24_list_orders,
  cafe24_update_order_status,
  OrderDetailParamsSchema,
  OrdersSearchParamsSchema,
  OrderUpdateStatusParamsSchema,
} from "./tools/order.js";
import {
  CategoriesSearchParamsSchema,
  cafe24_create_product,
  cafe24_delete_product,
  cafe24_get_product,
  cafe24_list_categories,
  cafe24_list_products,
  cafe24_update_product,
  ProductCreateParamsSchema,
  ProductDetailParamsSchema,
  ProductsSearchParamsSchema,
  ProductUpdateParamsSchema,
} from "./tools/product.js";
import {
  CouponCreateParamsSchema,
  CouponDetailParamsSchema,
  CouponsSearchParamsSchema,
  cafe24_create_coupon,
  cafe24_get_coupon,
  cafe24_list_coupons,
} from "./tools/promotion.js";
import {
  cafe24_get_store,
  cafe24_list_shops,
  cafe24_list_users,
  cafe24_update_store,
  ShopsSearchParamsSchema,
  StoreDetailParamsSchema,
  StoreUpdateParamsSchema,
  UsersSearchParamsSchema,
} from "./tools/store.js";

const server = new McpServer({
  name: "cafe24-admin-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "cafe24_list_users",
  {
    title: "List Cafe24 Admin Users",
    description:
      "Retrieve a list of admin users in Cafe24. Returns user details including ID, name, email, group, and status. Supports pagination and filtering by member ID, email, or name.",
    inputSchema: UsersSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_users,
);

server.registerTool(
  "cafe24_list_shops",
  {
    title: "List Cafe24 Shops",
    description:
      "Retrieve a list of shops in Cafe24. Returns shop details including shop number, name, currency, and locale. Supports pagination and filtering by shop number.",
    inputSchema: ShopsSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_shops,
);

server.registerTool(
  "cafe24_get_store",
  {
    title: "Get Cafe24 Store Details",
    description:
      "Retrieve detailed information about the Cafe24 store including mall ID, mall name, shop number, currency code, and currency symbol. Use shop_no parameter for multi-store malls.",
    inputSchema: StoreDetailParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_store,
);

server.registerTool(
  "cafe24_update_store",
  {
    title: "Update Cafe24 Store Settings",
    description:
      "Update store information including mall name, shop name, and currency code. Only provided fields will be updated.",
    inputSchema: StoreUpdateParamsSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  cafe24_update_store,
);

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
    inputSchema: z
      .object({
        product_no: z.number().describe("Product number"),
      })
      .strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ product_no }) => {
    return await cafe24_delete_product(product_no);
  },
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

server.registerTool(
  "cafe24_list_orders",
  {
    title: "List Cafe24 Orders",
    description:
      "Retrieve a list of orders from Cafe24. Returns order details including order ID, name, status codes, payment status, amount, customer info, and order date. Supports extensive filtering by order ID, date range, and order status code. Paginated results.",
    inputSchema: OrdersSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_orders,
);

server.registerTool(
  "cafe24_get_order",
  {
    title: "Get Cafe24 Order Details",
    description:
      "Retrieve detailed information about a specific order by order ID. Returns complete order details including status, payment info, amount, customer, and order date.",
    inputSchema: OrderDetailParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_order,
);

server.registerTool(
  "cafe24_update_order_status",
  {
    title: "Update Cafe24 Order Status",
    description:
      "Update the status of an existing order in Cafe24. Requires order ID and new status code.",
    inputSchema: OrderUpdateStatusParamsSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  cafe24_update_order_status,
);

server.registerTool(
  "cafe24_list_customers",
  {
    title: "List Cafe24 Customers",
    description:
      "Retrieve a list of customers from Cafe24. Returns customer details including member ID, name, email, phone, birthdate, gender, join date, and group. Supports pagination and filtering by member ID, email, or name.",
    inputSchema: CustomersSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_customers,
);

server.registerTool(
  "cafe24_get_customer",
  {
    title: "Get Cafe24 Customer Details",
    description:
      "Retrieve detailed information about a specific customer by member ID. Returns complete customer details including personal information and join date.",
    inputSchema: CustomerDetailParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_customer,
);

server.registerTool(
  "cafe24_list_boards",
  {
    title: "List Cafe24 Boards",
    description:
      "Retrieve a list of boards from Cafe24. Returns board details including board number, name, type, display status, and usage status. Supports pagination and filtering by board number.",
    inputSchema: BoardsSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_boards,
);

server.registerTool(
  "cafe24_get_board",
  {
    title: "Get Cafe24 Board Details",
    description:
      "Retrieve detailed information about a specific board by board number. Returns complete board details including type and status.",
    inputSchema: BoardDetailParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_board,
);

server.registerTool(
  "cafe24_list_coupons",
  {
    title: "List Cafe24 Benefits/Coupons",
    description:
      "Retrieve a list of benefits/coupons from Cafe24. Returns benefit/coupon details including number, name, and validity period. Supports pagination and filtering by benefit number.",
    inputSchema: CouponsSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_coupons,
);

server.registerTool(
  "cafe24_get_coupon",
  {
    title: "Get Cafe24 Coupon Details",
    description:
      "Retrieve detailed information about a specific coupon by coupon number. Returns complete coupon details including name and validity.",
    inputSchema: CouponDetailParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_coupon,
);

server.registerTool(
  "cafe24_create_coupon",
  {
    title: "Create Cafe24 Coupon",
    description:
      "Create a new coupon/benefit in Cafe24. Requires benefit number, coupon number, type, name, validity period, discount value, and optionally issuance limit.",
    inputSchema: CouponCreateParamsSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  cafe24_create_coupon,
);

server.registerTool(
  "cafe24_list_themes",
  {
    title: "List Cafe24 Themes",
    description:
      "Retrieve a list of themes from Cafe24. Returns theme details including theme number and name. Supports pagination.",
    inputSchema: ThemesSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_themes,
);

server.registerTool(
  "cafe24_list_suppliers",
  {
    title: "List Cafe24 Suppliers",
    description:
      "Retrieve a list of suppliers from Cafe24. Returns supplier details including supplier number and name. Supports pagination.",
    inputSchema: SuppliersSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_list_suppliers,
);

server.registerTool(
  "cafe24_get_daily_sales",
  {
    title: "Get Cafe24 Daily Sales Report",
    description:
      "Retrieve daily sales report from Cafe24. Requires date range and supports pagination. Returns sales count and amount for each day.",
    inputSchema: SalesSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_daily_sales,
);

server.registerTool(
  "cafe24_get_points",
  {
    title: "Get Cafe24 Points Transactions",
    description:
      "Retrieve point/mileage transactions from Cafe24. Requires date range and supports pagination. Returns point details including member ID, type, amount, and date.",
    inputSchema: MileageSearchParamsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  cafe24_get_points,
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cafe24 Admin MCP server running via stdio");
}

run().catch((error) => {
  console.error("Fatal error in server:", error);
  process.exit(1);
});
