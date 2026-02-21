# Rule: Zod Mini

## Why It Matters

Zod Mini provides a functional, tree-shakeable API optimized for minimal bundle size. Use for frontend applications, mobile apps, and anywhere bundle size matters.

## Import Path

```typescript
// Instead of:
import { z } from "zod"

// Use:
import * as z from "zod/mini"
```

## Functional API

```typescript
import * as z from "zod/mini"

// Functional syntax instead of method chaining
const name = z.string({ min: 1, max: 100 })
const email = z.string({ format: "email" })
const age = z.number({ min: 0, max: 150 })

// Object schema
const User = z.object({
  name,
  email,
  age
})
```

## Available Types

```typescript
// Primitives
z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.symbol()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
z.never()
z.nan()

// Collections
z.array(z.string())
z.tuple([z.string(), z.number()])
z.record(z.string())
z.map(z.string(), z.number())
z.set(z.string())
```

## String Options

```typescript
// All string options as parameters
const Name = z.string({
  min: 1,
  max: 100,
  pattern: /^[a-z]+$/,
  format: undefined,
  email: false,
  url: false,
  uuid: false,
  // ...
})

// Or use format shorthand
const Email = z.string({ format: "email" })
const Url = z.string({ format: "url" })
const Uuid = z.string({ format: "uuid" })
```

## Number Options

```typescript
const Age = z.number({
  min: 0,
  max: 150,
  int: true,
  // ...
})

const Positive = z.number({ min: 0, exclusiveMin: true })
const Integer = z.number({ int: true })
```

## Array Options

```typescript
const Tags = z.array(z.string(), {
  min: 1,
  max: 10,
  // ...
})

const NonEmpty = z.array(z.string(), { min: 1 })
```

## Object Options

```typescript
const User = z.object({
  name: z.string(),
  email: z.string()
}, {
  // Object-level options
  strict: true,
  // ...
})
```

## Optional and Nullable

```typescript
// Inline optional/nullable
const OptionalName = z.string({ optional: true })
const NullableName = z.string({ nullable: true })
const NullishName = z.string({ nullish: true })

// Or wrapper functions
const Opt = z.optional(z.string())
const Null = z.nullable(z.string())
```

## Default Values

```typescript
// Inline default
const Role = z.string({ default: "user" })

// Wrapper function
const WithDefault = z.default(z.string(), "user")
```

## Refinements

```typescript
// Functional refine
const Even = z.refine(z.number(), (n) => n % 2 === 0, {
  message: "Must be even"
})

// Multiple refinements
const Positive = z.pipe([
  z.number(),
  z.refine((n) => n > 0, { message: "Positive required" })
])
```

## Transforms

```typescript
// Functional transform
const Upper = z.transform(z.string(), (s) => s.toUpperCase())

// With pipe
const Processed = z.pipe([
  z.string(),
  z.transform((s) => s.trim()),
  z.transform((s) => s.toLowerCase())
])
```

## Union Types

```typescript
// Union
const StringOrNumber = z.union([z.string(), z.number()])

// Discriminated union
const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number() }),
  z.object({ type: z.literal("keypress"), key: z.string() })
])
```

## Literal and Enum

```typescript
// Literal
const Status = z.literal("active")

// Enum
const Role = z.enum(["admin", "user", "guest"])
```

## Pipe

```typescript
// Pipeline of schemas
const schema = z.pipe([
  z.string(),
  z.transform((s) => JSON.parse(s)),
  z.object({ id: z.string() })
])
```

## Parsing

```typescript
// Same API as regular Zod
const result = User.parse(data)
const safeResult = User.safeParse(data)
const asyncResult = await User.parseAsync(data)
```

## Bundle Size Comparison

```typescript
// Full Zod
import { z } from "zod"  // ~50-60KB

// Zod Mini
import * as z from "zod/mini"  // ~10-15KB

// With tree-shaking, only used types are included
```

## When to Use Zod Mini

| Use Case | Recommendation |
|----------|----------------|
| Backend API | Full Zod |
| Frontend app | Zod Mini |
| Mobile/React Native | Zod Mini |
| Library code | Zod Mini |
| CLI tools | Full Zod |
| Full-stack with shared types | Full Zod or Mini based on bundle needs |

## Migration from Full Zod

```typescript
// Full Zod
const User = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
})

// Zod Mini
const User = z.object({
  name: z.string({ min: 1, max: 100 }),
  email: z.string({ format: "email" })
})
```

## Tips

1. **Use for frontend**: Minimal bundle impact
2. **Functional style**: Options objects over method chains
3. **Same validation**: Full Zod features in smaller package
4. **Tree-shakeable**: Only import what you need
5. **Compatible types**: Can share types with full Zod
