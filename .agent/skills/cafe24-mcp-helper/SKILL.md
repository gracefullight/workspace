---
name: cafe24-mcp-helper
description: Guide for implementing Cafe24 Admin API tools in the mcp-cafe24-admin server. Use this skill when adding new API endpoints, refactoring tool structures, or defining Zod schemas for Cafe24.
---

# Cafe24 MCP Helper

This skill provides a systematic workflow for adding new Cafe24 Admin API functionalities to the MCP server.

## Workflow

Follow these steps when implementing new tools based on a user's `curl` request or API documentation:

1. **Analyze the Request**: Identify the resource name, HTTP method, endpoint, parameters, and response structure.
2. **Define Types**: Create a new type file in `src/types/{feature}.ts` (kebab-case).
   - Use interfaces for API responses and nested objects.
   - Export everything and add an export statement to `src/types/index.ts`.
3. **Define Schemas**: Create a new Zod schema file in `src/schemas/{feature}.ts`.
   - Use `.strict()` for input schemas.
   - Add descriptive strings to `.describe()`.
   - Follow established paging patterns (limit: 1-500, default 10/20).
4. **Implement Tools**: Create a new tool file in `src/tools/{feature}.ts`.
   - Use `makeApiRequest` and `handleApiError` from `../services/api-client.js`.
   - Return both `content` (Markdown string) and `structuredContent` (JSON).
5. **Register Tools**: Update `src/tools/index.ts`.
   - Import `registerTools` as `register{Feature}Tools`.
   - Call `register{Feature}Tools(server)` in `registerAllTools`.
6. **Verify**:
   - Run `pnpm lint && pnpm typecheck`.
   - Use `pnpm biome check src --write` to fix linting errors.

## Implementation Details

See [references/api_reference.md](references/api_reference.md) for code patterns and directory structure guidelines.

## Best Practices

- **Naming**: Use camelCase for function names (e.g., `cafe24_list_orders`) and PascalCase for schemas (e.g., `OrdersSearchParamsSchema`).
- **File Names**: Always use kebab-case for filenames (e.g., `order-control.ts` instead of `orderControl.ts`).
- **Imports**: Use relative imports for local files and `@/types/index.js` for types.
- **Error Handling**: Always wrap tool logic in `try-catch` and use `handleApiError`.
- **Tool Structure**: Separate handler functions from registration. Use `server.registerTool()` with `annotations`. See [references/api_reference.md](references/api_reference.md#tool-registration-pattern).
