# Rule: Registries

## Why It Matters

Registries store schema metadata and enable schema lookup by ID. Use for documentation generation, schema sharing, and building tools that work with multiple schemas.

## z.registry()

Create a schema registry.

```typescript
import { z } from "zod"

// Create registry
const myRegistry = z.registry()

// Register schema
const User = z.object({
  id: z.string(),
  name: z.string()
}).register(myRegistry, { id: "User" })
```

## z.globalRegistry

Built-in global registry.

```typescript
// Register to global registry
const Product = z.object({
  id: z.string(),
  name: z.string()
}).register(z.globalRegistry, { id: "Product" })

// Access global registry
z.globalRegistry.get("Product") // Schema
```

## Registry Methods

### Register Schema

```typescript
const registry = z.registry()

const User = z.object({
  id: z.string(),
  name: z.string()
}).register(registry, {
  id: "User",
  title: "User Schema",
  description: "Represents a user in the system"
})
```

### Get Schema

```typescript
// Get by ID
const schema = registry.get("User")

// Get all registered schemas
const all = registry.getAll()
```

### Has Schema

```typescript
if (registry.has("User")) {
  const schema = registry.get("User")
}
```

## Metadata in Registry

```typescript
interface RegistryMetadata {
  id?: string
  title?: string
  description?: string
  url?: string
  // Custom fields
  [key: string]: unknown
}

const User = z.object({
  id: z.string(),
  name: z.string()
}).register(registry, {
  id: "User",
  title: "User",
  description: "A registered user",
  version: "1.0.0",
  deprecated: false
})
```

## Common Patterns

### API Schema Registry

```typescript
const apiRegistry = z.registry()

// Register all API schemas
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string()
}).register(apiRegistry, {
  id: "CreateUserRequest"
})

const UserResponse = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string()
}).register(apiRegistry, {
  id: "UserResponse"
})

// Get schema for code generation
function generateOpenAPIDocs() {
  const schemas = apiRegistry.getAll()
  // Generate OpenAPI from schemas
}
```

### Schema Documentation

```typescript
const docRegistry = z.registry()

const User = z.object({
  id: z.string().describe("Unique user identifier"),
  email: z.string().email().describe("User's email address"),
  name: z.string().describe("User's display name")
}).register(docRegistry, {
  id: "User",
  title: "User",
  description: "Represents a user account"
})

// Generate docs
function generateDocs() {
  for (const [id, schema] of docRegistry.entries()) {
    console.log(`## ${id}`)
    console.log(schema.description)
    // Print field descriptions
  }
}
```

### Schema Versioning

```typescript
const versionRegistry = z.registry()

const UserV1 = z.object({
  id: z.string(),
  name: z.string()
}).register(versionRegistry, { id: "User", version: "1" })

const UserV2 = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
}).register(versionRegistry, { id: "User", version: "2" })

// Get specific version
function getSchema(id: string, version: string) {
  return versionRegistry.getAll().find(
    s => s.id === id && s.version === version
  )
}
```

### Type Registry

```typescript
const typeRegistry = z.registry()

// Register commonly used types
const UUID = z.string().uuid().register(typeRegistry, {
  id: "UUID",
  description: "RFC 4122 UUID"
})

const Email = z.string().email().register(typeRegistry, {
  id: "Email",
  description: "Email address"
})

const Timestamp = z.number().int().positive().register(typeRegistry, {
  id: "Timestamp",
  description: "Unix timestamp in milliseconds"
})
```

## Custom Registry Class

```typescript
class SchemaRegistry {
  private schemas = new Map<string, z.ZodType>()

  register<T extends z.ZodType>(id: string, schema: T): T {
    this.schemas.set(id, schema)
    return schema
  }

  get<T extends z.ZodType>(id: string): T | undefined {
    return this.schemas.get(id) as T | undefined
  }

  has(id: string): boolean {
    return this.schemas.has(id)
  }

  getAll(): Map<string, z.ZodType> {
    return new Map(this.schemas)
  }
}

const myRegistry = new SchemaRegistry()
```

## Registry vs .meta()

| Feature | Registry | .meta() |
|---------|----------|---------|
| Scope | Multiple schemas | Single schema |
| Lookup | By ID | On schema object |
| Sharing | Cross-schema | Schema-specific |
| Use case | Documentation, tools | Schema metadata |

## Type Inference

```typescript
// Registry doesn't affect type inference
const User = z.object({
  id: z.string(),
  name: z.string()
}).register(registry, { id: "User" })

type User = z.infer<typeof User>
// { id: string; name: string } - unchanged
```

## Tips

1. **Use for documentation**: Collect all schemas in one place
2. **Use for code generation**: Generate types, OpenAPI, etc.
3. **Namespace IDs**: Avoid collisions with prefixed IDs
4. **Version metadata**: Track schema versions
5. **Global for simple use**: Use z.globalRegistry for single-registry apps
