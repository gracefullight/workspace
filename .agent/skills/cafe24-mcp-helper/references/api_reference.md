# Cafe24 MCP Implementation Reference

This reference provides established patterns for implementing Cafe24 Admin API tools as MCP tools.

## Zod Schema Patterns

### Search Params
Use for GET requests that list resources with pagination and filters.
```typescript
export const ResourceSearchParamsSchema = z.object({
  shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
  limit: z.number().int().min(1).max(500).default(20).describe("Limit"),
  offset: z.number().int().min(0).default(0).describe("Offset"),
  // add specific filters here
}).strict();
```

### Action Params
Use for POST/PUT/DELETE requests.
```typescript
export const ResourceCreateParamsSchema = z.object({
  shop_no: z.number().int().min(1).default(1).describe("Shop Number"),
  requests: z.array(z.object({
    // payload structure from API docs
  })).describe("List of requests"),
}).strict();
```

## Tool Implementation Patterns

### GET (List)
```typescript
async function cafe24_list_resources(params: z.infer<typeof ResourceSearchParamsSchema>) {
  try {
    const data = await makeApiRequest<{ resources: Resource[] }>(
      "/admin/resources",
      "GET",
      undefined,
      params,
    );
    const resources = data.resources || [];
    return {
      content: [{ type: "text", text: `Found ${resources.length} ...` }],
      structuredContent: { resources },
    };
  } catch (error) {
    return { content: [{ type: "text", text: handleApiError(error) }] };
  }
}
```

### POST/PUT
```typescript
async function cafe24_create_resource(params: z.infer<typeof ResourceCreateParamsSchema>) {
  try {
    const data = await makeApiRequest<{ resources: any[] }>(
      "/admin/resources",
      "POST",
      params,
    );
    return {
      content: [{ type: "text", text: "Success" }],
      structuredContent: { results: data.resources },
    };
  } catch (error) {
    return { content: [{ type: "text", text: handleApiError(error) }] };
  }
}
```

## Project Structure
- Types: `src/types/{feature}.ts` (and export in `src/types/index.ts`)
- Schemas: `src/schemas/{feature}.ts`
- Tools: `src/tools/{feature}.ts`
- Registration: Update `src/tools/index.ts`

## Tool Registration Pattern

Use `server.registerTool()` with full metadata for proper tool registration:

```typescript
export function registerTools(server: McpServer): void {
  server.registerTool(
    "cafe24_get_resource",
    {
      title: "Get Resource",
      description: "Retrieve resource from Cafe24",
      inputSchema: ResourceParamsSchema,
      annotations: {
        readOnlyHint: true,      // true for GET operations
        destructiveHint: false,  // true for DELETE operations
        idempotentHint: true,    // true for GET/PUT, false for POST
        openWorldHint: true,     // true for GET, false for mutations
      },
    },
    cafe24_get_resource,
  );
}
```

Key points:
- Use `server.registerTool()` (not `server.tool()`) for full metadata support
- Cast `structuredContent` to `Record<string, unknown>` for type compatibility: `data as unknown as Record<string, unknown>`
- Always include `annotations` object with appropriate hints
- Define handler functions at module level, separate from registration
