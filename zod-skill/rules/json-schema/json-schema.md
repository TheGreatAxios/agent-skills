# Rule: JSON Schema Conversion

## Why It Matters

Converting Zod schemas to JSON Schema enables interoperability with tools that consume JSON Schema: OpenAPI, form generators, mock data tools, and documentation generators.

## z.toJSONSchema()

Convert Zod schema to JSON Schema.

```typescript
import { z } from "zod"

const User = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().optional()
})

const jsonSchema = z.toJSONSchema(User)

console.log(jsonSchema)
// {
//   type: "object",
//   properties: {
//     id: { type: "string", format: "uuid" },
//     name: { type: "string" },
//     email: { type: "string", format: "email" },
//     age: { type: "integer", minimum: 1 }
//   },
//   required: ["id", "name", "email"]
// }
```

## Configuration Options

```typescript
const jsonSchema = z.toJSONSchema(schema, {
  // Include descriptions
  description: true,

  // Target JSON Schema version
  target: "jsonSchema7", // "jsonSchema7" | "jsonSchema2019-09" | "openApi3"

  // Custom unrepresentable handling
  unrepresentable: "throw", // "throw" | "any" | "ignore"

  // Additional options
  // ...
})
```

## Type Mappings

| Zod Type | JSON Schema |
|----------|-------------|
| `z.string()` | `{ type: "string" }` |
| `z.number()` | `{ type: "number" }` |
| `z.number().int()` | `{ type: "integer" }` |
| `z.boolean()` | `{ type: "boolean" }` |
| `z.null()` | `{ type: "null" }` |
| `z.array()` | `{ type: "array", items: ... }` |
| `z.object()` | `{ type: "object", properties: ... }` |
| `z.enum()` | `{ enum: [...] }` |
| `z.literal()` | `{ const: ... }` |
| `z.union()` | `{ oneOf: [...] }` |
| `z.optional()` | Added to optional properties |

## Format Mappings

| Zod Method | JSON Schema Format |
|------------|-------------------|
| `.email()` | `format: "email"` |
| `.url()` | `format: "uri"` |
| `.uuid()` | `format: "uuid"` |
| `.datetime()` | `format: "date-time"` |
| `.date()` | `format: "date"` |
| `.time()` | `format: "time"` |
| `.ip()` | `format: "ipv4"` or `format: "ipv6"` |

## Constraint Mappings

| Zod Method | JSON Schema |
|------------|-------------|
| `.min(n)` (string) | `minLength: n` |
| `.max(n)` (string) | `maxLength: n` |
| `.length(n)` (string) | `minLength: n, maxLength: n` |
| `.min(n)` (number) | `minimum: n` |
| `.max(n)` (number) | `maximum: n` |
| `.int()` | `type: "integer"` |
| `.regex()` | `pattern: "..."` |
| `.min(n)` (array) | `minItems: n` |
| `.max(n)` (array) | `maxItems: n` |

## Common Patterns

### OpenAPI Generation

```typescript
const CreateUser = z.object({
  email: z.string().email().describe("User email"),
  name: z.string().min(1).max(100).describe("Display name")
})

const openApiSchema = z.toJSONSchema(CreateUser, {
  target: "openApi3"
})

// Use in OpenAPI spec
const spec = {
  openapi: "3.0.0",
  paths: {
    "/users": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: openApiSchema
            }
          }
        }
      }
    }
  }
}
```

### With Definitions

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
})

const Post = z.object({
  id: z.string(),
  author: User,
  title: z.string()
})

const schema = z.toJSONSchema(Post, {
  definitions: {
    User: User
  }
})

// {
//   type: "object",
//   properties: {
//     author: { $ref: "#/definitions/User" },
//     ...
//   },
//   definitions: {
//     User: { type: "object", properties: { ... } }
//   }
// }
```

### Recursive Schemas

```typescript
const Node: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(Node).optional()
  })
)

interface TreeNode {
  value: string
  children?: TreeNode[]
}

// JSON Schema with recursive references
const schema = z.toJSONSchema(Node)
```

### Form Generation

```typescript
const FormSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  subscribe: z.boolean().default(false)
})

const formConfig = z.toJSONSchema(FormSchema)

// Use with form library to generate inputs
```

## Handling Unrepresentable

```typescript
// Some Zod features don't have JSON Schema equivalents
const WithTransform = z.string().transform(s => s.toUpperCase())

// Default: throws error
z.toJSONSchema(WithTransform) // Error

// Ignore: skip unrepresentable
z.toJSONSchema(WithTransform, { unrepresentable: "ignore" })
// { type: "string" }

// Any: use any schema
z.toJSONSchema(WithTransform, { unrepresentable: "any" })
// {}
```

## Descriptions

```typescript
const User = z.object({
  id: z.string().describe("Unique identifier"),
  name: z.string().describe("User's name")
})

z.toJSONSchema(User, { description: true })
// {
//   type: "object",
//   properties: {
//     id: { type: "string", description: "Unique identifier" },
//     name: { type: "string", description: "User's name" }
//   }
// }
```

## Examples

```typescript
const User = z.object({
  email: z.string().email()
}).meta({
  examples: [{ email: "user@example.com" }]
})

z.toJSONSchema(User)
// { type: "object", properties: { ... }, examples: [{ email: "user@example.com" }] }
```

## Tips

1. **Use for API docs**: Generate OpenAPI specs from Zod
2. **Handle transforms**: They're not representable in JSON Schema
3. **Include descriptions**: Makes generated docs useful
4. **Use definitions**: For shared/referenced schemas
5. **Test output**: Verify generated schema matches expectations
