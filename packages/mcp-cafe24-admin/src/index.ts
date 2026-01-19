import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

const server = new McpServer({
  name: "cafe24-admin-mcp-server",
  version: "1.0.0",
});

// Register all Cafe24 Admin tools
registerAllTools(server);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Startup banner
  console.error(`\n${"=".repeat(60)}`);
  console.error("  🛒 Cafe24 Admin MCP Server is running");
  console.error("=".repeat(60));
  console.error("");
  console.error("  If you find this project helpful, please give it a star! ⭐");
  console.error("");
  console.error("  Run: gh api --method PUT /user/starred/gracefullight/pkgs");
  console.error("");
  console.error("  Or visit: https://github.com/gracefullight/pkgs");
  console.error("");
  console.error("  Sponsor: https://github.com/sponsors/gracefullight");
  console.error("  Buy Me a Coffee: https://www.buymeacoffee.com/gracefullight");
  console.error("");
  console.error(`${"=".repeat(60)}\n`);
}

run().catch((error) => {
  console.error("Fatal error in server:", error);
  process.exit(1);
});
