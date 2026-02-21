# Rule: Metadata and Description

## Why It Matters

Metadata and descriptions document schemas for developers and tools. Use for API documentation, IDE hints, and schema introspection.

## .describe()

Add description to schema.

```typescript
import { z } from "zod"

const User = z.object({
  id: z.string().uuid().describe("Unique identifier for the user"),
  email: z.string().email().describe("User's email address"),
  name: z.string().describe("User's display name"),
  role: z.enum(["admin", "user"]).describe("User's permission level")
}).describe("A registered user in the system")
```

## Accessing Description

```typescript
const schema = z.string().describe("A string value")

schema.description // "A string value"
```

## .meta()

Add custom metadata to schema.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
}).meta({
  id: "User",
  title: "User Schema",
  deprecated: false,
  version: "1.0.0",
  tags: ["api", "public"]
})
```

## Accessing Metadata

```typescript
const schema = z.string().meta({ custom: "value" })

schema.meta() // { custom: "value" }
```

## Common Patterns

### API Documentation

```typescript
const CreateUser = z.object({
  email: z.string()
    .email()
    .describe("Valid email address for account"),
  password: z.string()
    .min(8)
    .describe("Password with at least 8 characters"),
  name: z.string()
    .min(1)
    .max(100)
    .describe("User's display name (1-100 characters)")
}).describe("Request body for creating a new user")

const UserResponse = z.object({
  id: z.string().uuid().describe("Unique user ID"),
  email: z.string().email().describe("User's email"),
  name: z.string().describe("Display name"),
  createdAt: z.string().datetime().describe("Account creation timestamp")
}).describe("User data returned from API")
```

### JSON Schema Generation

```typescript
// Descriptions appear in generated JSON Schema
const schema = z.object({
  name: z.string().describe("User name"),
  age: z.number().describe("User age in years")
})

const jsonSchema = z.toJSONSchema(schema)
// {
//   type: "object",
//   properties: {
//     name: { type: "string", description: "User name" },
//     age: { type: "number", description: "User age in years" }
//   }
// }
```

### OpenAPI Integration

```typescript
const Product = z.object({
  id: z.string().describe("Product SKU"),
  name: z.string().describe("Product display name"),
  price: z.number().positive().describe("Price in USD"),
  inStock: z.boolean().describe("Availability status")
}).describe("Product in the catalog")

// Meta for OpenAPI extensions
const ProductWithMeta = Product.meta({
  "x-resource": "products",
  "x-auth": ["read:products"]
})
```

### Form Field Documentation

```typescript
const RegistrationForm = z.object({
  email: z.string()
    .email()
    .describe("We'll never share your email"),
  password: z.string()
    .min(8)
    .max(128)
    .describe("At least 8 characters, include numbers and symbols"),
  confirmPassword: z.string()
    .describe("Re-enter your password to confirm"),
  acceptTerms: z.boolean()
    .refine(v => v, "You must accept the terms")
    .describe("I agree to the Terms of Service and Privacy Policy")
})
```

### Deprecated Fields

```typescript
const User = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string()
    .describe("DEPRECATED: Use 'name' instead")
    .meta({ deprecated: true, replacement: "name" }),
  email: z.string().email()
})
```

### Validation Hints

```typescript
const Password = z.string()
  .min(8)
  .max(128)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .describe(`Password requirements:
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number`)
```

### Enum Documentation

```typescript
const Status = z.enum([
  "draft",
  "pending",
  "published",
  "archived"
]).describe(`Publication status:
- draft: Initial state, not visible
- pending: Awaiting review
- published: Live and visible
- archived: No longer active`)
```

## Combining describe() and meta()

```typescript
const User = z.object({
  id: z.string().uuid()
    .describe("Unique identifier")
    .meta({ example: "123e4567-e89b-12d3-a456-426614174000" }),

  email: z.string().email()
    .describe("User's email address")
    .meta({ format: "email", sensitive: true }),

  role: z.enum(["admin", "user", "guest"])
    .describe("Permission level")
    .meta({ default: "user" })
})
```

## Introspection

```typescript
function getSchemaInfo(schema: z.ZodTypeAny) {
  return {
    description: schema.description,
    meta: schema.meta(),
    typeName: schema._def.typeName
  }
}

const schema = z.string().describe("A value").meta({ id: "value" })
getSchemaInfo(schema)
// { description: "A value", meta: { id: "value" }, typeName: "ZodString" }
```

## Documentation Generation

```typescript
function generateMarkdownDocs(schema: z.ZodObject<any>) {
  const lines: string[] = []

  lines.push(`# ${schema.description || "Schema"}`)
  lines.push("")

  for (const [key, field] of Object.entries(schema.shape)) {
    const desc = (field as any).description || "No description"
    lines.push(`- **${key}**: ${desc}`)
  }

  return lines.join("\n")
}
```

## Tips

1. **Use for API docs**: Descriptions appear in generated docs
2. **Be specific**: Clear descriptions help developers
3. **Include examples**: Use meta() for example values
4. **Mark deprecated**: Help users migrate
5. **Multi-line allowed**: Descriptions can contain newlines
