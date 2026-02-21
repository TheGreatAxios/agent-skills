# Rule: Pipes

## Why It Matters

Pipes chain schemas together, passing output of one as input to the next. Use for multi-stage validation, transformation pipelines, and composing complex schemas from simpler ones.

## z.pipe()

Chain schemas sequentially.

```typescript
import { z } from "zod"

// Pipe string validation into number
const StringToNumber = z.string().pipe(z.coerce.number())

// Parse string, get number
StringToNumber.parse("123") // 123 (number)
```

## Basic Usage

```typescript
// Validate as string, then validate as UUID
const Uuid = z.string().pipe(z.string().uuid())

// Coerce to number, validate as positive
const PositiveNumber = z.coerce.number().pipe(z.number().positive())

// Parse JSON string, validate object
const JsonObject = z.string()
  .transform(s => JSON.parse(s))
  .pipe(z.object({ id: z.string() }))
```

## Chaining Multiple Pipes

```typescript
const Processed = z.string()
  .pipe(z.string().trim())
  .pipe(z.string().min(1))
  .pipe(z.string().email())
  .pipe(z.string().transform(e => e.toLowerCase()))

Processed.parse("  TEST@EXAMPLE.COM  ") // "test@example.com"
```

## Common Patterns

### String to Object

```typescript
// JSON string to typed object
const JsonUser = z.string()
  .transform(s => JSON.parse(s))
  .pipe(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
  }))

const user = JsonUser.parse('{"id":"1","name":"John","email":"john@example.com"}')
// { id: "1", name: "John", email: "john@example.com" }
```

### Coercion Pipeline

```typescript
// String -> Number -> Positive Integer
const PositiveInt = z.string()
  .pipe(z.coerce.number())
  .pipe(z.number().int())
  .pipe(z.number().positive())

PositiveInt.parse("42") // 42
PositiveInt.parse("-5") // ✗ fails at positive stage
PositiveInt.parse("3.14") // ✗ fails at int stage
```

### Date Processing

```typescript
// ISO string -> Date -> Validated date
const FutureDate = z.string()
  .datetime()
  .pipe(z.coerce.date())
  .pipe(z.date().min(new Date()))

FutureDate.parse("2025-01-01T00:00:00Z") // Date object
```

### Email Processing

```typescript
const CleanEmail = z.string()
  .pipe(z.string().trim())
  .pipe(z.string().toLowerCase())
  .pipe(z.string().email())

CleanEmail.parse("  JOHN@EXAMPLE.COM  ") // "john@example.com"
```

### Base64 Decode

```typescript
const Base64ToString = z.string()
  .transform(s => Buffer.from(s, "base64").toString())
  .pipe(z.string())

// Or with atob
const Base64Alt = z.string()
  .transform(s => atob(s))
  .pipe(z.string())
```

### URL Parsing

```typescript
const UrlComponents = z.string()
  .url()
  .transform(s => new URL(s))
  .pipe(z.object({
    protocol: z.string(),
    hostname: z.string(),
    pathname: z.string(),
    searchParams: z.instanceof(URLSearchParams)
  }).passthrough())
```

### FormData Processing

```typescript
const FormDataItem = z.string()
  .pipe(z.string().trim())
  .pipe(z.union([
    z.string().transform(s => Number(s)).pipe(z.number()),
    z.string(),
    z.literal("true").transform(() => true),
    z.literal("false").transform(() => false)
  ]))
```

## Pipe vs Transform

```typescript
// Pipe: Chain schemas
const Piped = z.string()
  .pipe(z.string().min(5))
  .pipe(z.string().max(100))

// Transform: Modify value
const Transformed = z.string()
  .transform(s => s.trim())
  .transform(s => s.toLowerCase())

// Combined: Validate then transform
const Combined = z.string()
  .pipe(z.string().email())
  .pipe(z.string().transform(e => e.toLowerCase()))
```

## Error Handling in Pipes

Each stage validates independently:

```typescript
const Schema = z.string()
  .pipe(z.string().min(5))
  .pipe(z.string().email())

try {
  Schema.parse("a@b.c") // Too short
} catch (error) {
  // Error from min(5) stage
}

try {
  Schema.parse("long-but-not-email")
} catch (error) {
  // Error from email() stage
}
```

## Type Inference

```typescript
// Pipe output is the output type of the last schema
const A = z.string().pipe(z.coerce.number())

type Input = z.input<typeof A>   // string
type Output = z.infer<typeof A>  // number

// Multiple pipes
const B = z.string()
  .pipe(z.string().trim())
  .pipe(z.coerce.number())
  .pipe(z.number().positive())

type BOutput = z.infer<typeof B> // number
```

## Async Pipes

```typescript
const AsyncPipe = z.string()
  .pipe(z.string().uuid())
  .transform(async (id) => {
    const user = await fetchUser(id)
    return user
  })
  .pipe(z.object({
    id: z.string(),
    name: z.string()
  }))

// Use parseAsync
const result = await AsyncPipe.parseAsync("user-uuid")
```

## Nested Pipes

```typescript
const NestedPipe = z.object({
  data: z.string()
    .pipe(z.string().transform(s => JSON.parse(s)))
    .pipe(z.object({ id: z.string() }))
})
```

## Common Use Cases

| Use Case | Example |
|----------|---------|
| String → Number | `z.string().pipe(z.coerce.number())` |
| JSON → Object | `z.string().transform(JSON.parse).pipe(schema)` |
| Coercion + Validation | `z.coerce.number().pipe(z.number().positive())` |
| Trim + Validate | `z.string().pipe(z.string().trim()).pipe(z.string().email())` |
| Decode + Parse | `z.string().transform(decode).pipe(schema)` |

## Tips

1. **Use for multi-stage validation**: Each stage is a complete schema
2. **Error isolation**: Errors show which stage failed
3. **Combine with transform**: Pipe for validation, transform for modification
4. **Input/output types differ**: Last schema determines output type
5. **Async requires parseAsync**: For async transforms in pipe
