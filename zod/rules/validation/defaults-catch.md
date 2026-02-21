# Rule: Defaults and Catch

## Why It Matters

Defaults and catch handlers provide fallback values when input is missing or invalid. Use for optional fields, environment variables, and graceful error handling.

## .default()

Provide default value when input is undefined.

```typescript
import { z } from "zod"

// Default value
const WithDefault = z.string().default("unknown")

WithDefault.parse(undefined) // "unknown"
WithDefault.parse("hello")   // "hello"
WithDefault.parse(null)      // ✗ null is not undefined
```

### Object Defaults

```typescript
const Config = z.object({
  name: z.string().default("app"),
  port: z.number().default(3000),
  debug: z.boolean().default(false)
})

Config.parse({}) // { name: "app", port: 3000, debug: false }
Config.parse({ name: "myapp" }) // { name: "myapp", port: 3000, debug: false }
```

### Nested Object Defaults

```typescript
const Settings = z.object({
  theme: z.object({
    mode: z.enum(["light", "dark"]).default("light"),
    accent: z.string().default("blue")
  }).default({})
})

Settings.parse({}) // { theme: { mode: "light", accent: "blue" } }
```

### Array Default

```typescript
const WithArray = z.object({
  tags: z.array(z.string()).default([])
})

WithArray.parse({}) // { tags: [] }
```

## .prefault()

Lazy default value (computed at parse time).

```typescript
// Function called when default needed
const WithPrefault = z.number().prefault(() => Date.now())

// New timestamp each time default is used
const result1 = WithPrefault.parse(undefined)
const result2 = WithPrefault.parse(undefined)
// result1 !== result2 (different timestamps)
```

### When to Use Prefault

```typescript
// Use prefault for:
// - Expensive computations
// - Time-dependent values
// - Mutable default objects (avoid sharing)

const WithMutableDefault = z.object({
  items: z.array(z.string()).prefault(() => [])
  // New array each time, not shared reference
})
```

## .catch()

Provide fallback when validation fails (catches errors).

```typescript
// Catch validation errors
const SafeNumber = z.number().catch(0)

SafeNumber.parse("not a number") // 0 (caught error)
SafeNumber.parse(123)           // 123

// Catch with function
const SafeString = z.string().catch(() => "error")

// Catch preserves type safety
type SafeNumber = z.infer<typeof SafeNumber> // number
```

### Catch with Context

```typescript
// v4: Access error context
const SafeNumber = z.number().catch((ctx) => {
  console.log("Caught error:", ctx.error)
  return 0
})
```

### Object with Catch

```typescript
const SafeConfig = z.object({
  port: z.number().catch(3000),
  host: z.string().catch("localhost")
})

SafeConfig.parse({ port: "invalid", host: "example.com" })
// { port: 3000, host: "example.com" }
```

## Default vs Catch

| Feature | .default() | .catch() |
|---------|------------|----------|
| Triggers on | undefined | Any validation error |
| Input "null" | Fails | Caught |
| Invalid input | Fails | Caught |
| Use case | Missing values | Error recovery |

```typescript
const DefaultSchema = z.string().default("fallback")
DefaultSchema.parse(undefined)    // "fallback"
DefaultSchema.parse(null)         // ✗ fails
DefaultSchema.parse(123)          // ✗ fails

const CatchSchema = z.string().catch("fallback")
CatchSchema.parse(undefined)      // "fallback"
CatchSchema.parse(null)           // "fallback"
CatchSchema.parse(123)            // "fallback"
```

## Common Patterns

### Environment Variables

```typescript
const Env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"])
    .default("info"),
  CACHE_TTL: z.coerce.number().default(3600)
})

const env = Env.parse(process.env)
```

### API Configuration

```typescript
const ApiConfig = z.object({
  baseUrl: z.string().url().default("https://api.example.com"),
  timeout: z.number().positive().default(5000),
  retries: z.number().int().min(0).max(5).default(3),
  headers: z.record(z.string()).default({})
})
```

### User Settings

```typescript
const UserSettings = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    frequency: z.enum(["instant", "daily", "weekly"]).default("daily")
  }).default({}),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    showEmail: z.boolean().default(false)
  }).default({})
})
```

### Form Defaults

```typescript
const SearchForm = z.object({
  query: z.string().default(""),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.enum(["relevance", "date", "popularity"]).default("relevance")
})

const initialForm = SearchForm.parse({}) // Get defaults for form
```

### Safe Parsing with Catch

```typescript
const SafeInput = z.object({
  count: z.number().int().positive().catch(1),
  filter: z.string().catch(""),
  enabled: z.boolean().catch(false)
})

// Never throws, always returns valid object
const result = SafeInput.parse(unsafeInput)
```

### Pagination

```typescript
const Pagination = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc")
})
```

## Optional vs Default

```typescript
// Optional: allows undefined
const Optional = z.string().optional()
type OptType = z.infer<typeof Optional> // string | undefined

// Default: provides value, type is string
const Defaulted = z.string().default("hello")
type DefType = z.infer<typeof Defaulted> // string

// Optional with default
const OptionalDefault = z.string().optional().default("hello")
// If undefined -> "hello", if provided -> must be string
```

## Type Inference

```typescript
// Default makes optional property required in output
const Schema = z.object({
  name: z.string().default("unknown"),
  age: z.number().optional()
})

type Input = z.input<typeof Schema>
// { name?: string | undefined; age?: number | undefined }

type Output = z.infer<typeof Schema>
// { name: string; age?: number | undefined }

// Catch preserves output type
const CatchSchema = z.number().catch(0)
type Caught = z.infer<typeof CatchSchema> // number
```

## Tips

1. **Use default for missing values**: When undefined should become a value
2. **Use catch for error recovery**: When invalid input should have fallback
3. **Use prefault for expensive defaults**: Lazy evaluation
4. **Mutable defaults need prefault**: Arrays, objects with new references
5. **Combine with optional**: `.optional().default()` for explicit handling
