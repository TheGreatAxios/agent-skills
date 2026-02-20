# Rule: Readonly Types

## Why It Matters

Readonly types prevent mutation of validated data. Use for immutable data structures, configuration objects, and ensuring data integrity after validation.

## .readonly()

Make schema output readonly.

```typescript
import { z } from "zod"

// Readonly object
const Config = z.object({
  apiKey: z.string(),
  endpoint: z.string().url()
}).readonly()

type Config = z.infer<typeof Config>
// {
//   readonly apiKey: string
//   readonly endpoint: string
// }

// TypeScript prevents mutation
const config = Config.parse({ apiKey: "key", endpoint: "https://api.example.com" })
config.apiKey = "new" // ✗ TypeScript error
```

## Readonly Arrays

```typescript
// Readonly array
const Tags = z.array(z.string()).readonly()

type Tags = z.infer<typeof Tags> // readonly string[]

const tags = Tags.parse(["a", "b", "c"])
tags.push("d") // ✗ TypeScript error
tags[0] = "x"  // ✗ TypeScript error
```

## Nested Readonly

```typescript
// Readonly with nested object
const User = z.object({
  id: z.string(),
  profile: z.object({
    name: z.string(),
    email: z.string().email()
  }).readonly()
}).readonly()

type User = z.infer<typeof User>
// {
//   readonly id: string
//   readonly profile: {
//     readonly name: string
//     readonly email: string
//   }
// }
```

## Deep Readonly Pattern

```typescript
// Make entire schema deeply readonly
function deepReadonly<T extends z.ZodTypeAny>(schema: T): z.ZodReadonly<T> {
  return schema.readonly()
}

// Apply to nested objects
const Config = z.object({
  settings: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean()
  }),
  credentials: z.object({
    apiKey: z.string(),
    secret: z.string()
  })
}).readonly()
```

## Common Patterns

### Immutable Configuration

```typescript
const AppConfig = z.object({
  name: z.string(),
  version: z.string(),
  features: z.object({
    enableFeatureA: z.boolean(),
    enableFeatureB: z.boolean()
  }).readonly()
}).readonly()

// Config cannot be modified after parsing
```

### Frozen State

```typescript
// Combine with Object.freeze at runtime
const FrozenConfig = z.object({
  apiKey: z.string(),
  endpoint: z.string().url()
}).readonly().transform(Object.freeze)

const config = FrozenConfig.parse({ apiKey: "key", endpoint: "https://..." })
// config is both readonly (TS) and frozen (runtime)
```

### API Response

```typescript
const ApiResponse = z.object({
  data: z.unknown(),
  meta: z.object({
    page: z.number(),
    total: z.number()
  }).readonly()
}).readonly()

// Response structure is immutable
```

### Readonly Tuples

```typescript
const Coordinate = z.tuple([z.number(), z.number()]).readonly()

type Coordinate = z.infer<typeof Coordinate>
// readonly [number, number]

const coord = Coordinate.parse([10, 20])
coord[0] = 5 // ✗ TypeScript error
```

### Readonly Records

```typescript
const Translations = z.record(z.string()).readonly()

type Translations = z.infer<typeof Translations>
// { readonly [key: string]: string }
```

## Readonly vs Object.freeze

```typescript
// .readonly(): TypeScript-only
const Schema = z.object({ value: z.string() }).readonly()
const data = Schema.parse({ value: "test" })
data.value = "new" // ✗ TypeScript error, but works at runtime

// .readonly() + freeze: Full immutability
const ImmutableSchema = z.object({ value: z.string() })
  .readonly()
  .transform(Object.freeze)

const immutable = ImmutableSchema.parse({ value: "test" })
immutable.value = "new" // TypeScript error AND runtime error
```

## Unwrapping

```typescript
const ReadonlySchema = z.object({ value: z.string() }).readonly()

// Get the inner schema (without readonly)
const WritableSchema = ReadonlySchema.unwrap()
// z.object({ value: z.string() })
```

## Type Inference

```typescript
// Object
const Object = z.object({ a: z.string() }).readonly()
type ObjectType = z.infer<typeof Object>
// { readonly a: string }

// Array
const Array = z.array(z.string()).readonly()
type ArrayType = z.infer<typeof Array>
// readonly string[]

// Tuple
const Tuple = z.tuple([z.string(), z.number()]).readonly()
type TupleType = z.infer<typeof Tuple>
// readonly [string, number]
```

## Combining with Other Methods

```typescript
// Readonly + optional
const Schema = z.object({
  id: z.string().readonly().optional()
})

// Readonly + nullable
const NullableReadonly = z.array(z.string()).readonly().nullable()

// Readonly + default
const WithDefault = z.object({
  items: z.array(z.string()).readonly().default([])
}).readonly()
```

## Object Methods with Readonly

```typescript
const Base = z.object({
  id: z.string(),
  name: z.string()
}).readonly()

// .pick(), .omit(), etc. preserve readonly
const Picked = Base.pick({ id: true }) // Still readonly
const Partial = Base.partial()         // Still readonly
```

## Tips

1. **Use for configs**: Configuration should be immutable
2. **Combine with freeze**: For runtime immutability
3. **Works on all types**: Objects, arrays, tuples, records
4. **Preserves through methods**: pick/omit maintain readonly
5. **Type-only by default**: Use transform for runtime enforcement
