# Rule: JSON Types

## Why It Matters

JSON types represent any valid JSON value. Use for flexible data storage, API payloads with dynamic structure, and configuration that accepts any JSON-compatible value.

## z.json()

Validates any JSON-compatible value.

```typescript
import { z } from "zod"

// Any valid JSON value
const JsonValue = z.json()

JsonValue.parse("string")        // ✓
JsonValue.parse(123)             // ✓
JsonValue.parse(true)            // ✓
JsonValue.parse(null)            // ✓
JsonValue.parse([1, 2, 3])       // ✓
JsonValue.parse({ key: "val" })  // ✓

// Invalid JSON values
JsonValue.parse(undefined)       // ✗
JsonValue.parse(() => {})        // ✗
JsonValue.parse(Symbol())        // ✗
```

## JSON Value Types

A valid JSON value is one of:
- `string`
- `number`
- `boolean`
- `null`
- Array of JSON values
- Object with JSON value properties

## Common Patterns

### JSON Column

```typescript
// Database JSON column validation
const JsonColumn = z.json()

const Entity = z.object({
  id: z.string(),
  data: JsonColumn,
  metadata: z.json().optional()
})
```

### API Response Body

```typescript
const Response = z.object({
  success: z.boolean(),
  data: z.json().nullable(),
  error: z.string().optional()
})
```

### Configuration Storage

```typescript
const Config = z.object({
  key: z.string(),
  value: z.json(),
  updatedAt: z.date()
})
```

### Webhook Payload

```typescript
const WebhookEvent = z.object({
  type: z.string(),
  payload: z.json(),
  timestamp: z.number()
})
```

## Custom JSON Schemas

### JSON Object

```typescript
// Must be an object (not primitive)
const JsonObject = z.record(z.json())
// or
const JsonObjectAlt = z.object({}).passthrough()
```

### JSON Array

```typescript
// Must be an array
const JsonArray = z.array(z.json())
```

### JSON with Constraints

```typescript
// JSON object with at least one key
const NonEmptyObject = z.record(z.json())
  .refine(obj => Object.keys(obj).length > 0)

// JSON array with constraints
const BoundedArray = z.array(z.json())
  .min(1)
  .max(100)
```

## Recursive JSON Type

```typescript
// Define recursive JSON type
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

// Recursive schema
const JsonValue: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValue),
    z.record(JsonValue)
  ])
)
```

## JSON String Parsing

```typescript
// Parse JSON string into typed value
const JsonString = z.string()
  .transform((str, ctx) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON string"
      })
      return z.NEVER
    }
  })
  .pipe(z.json())

JsonString.parse('{"key":"value"}') // { key: "value" }
JsonString.parse("not json")        // ✗ throws
```

## Type Inference

```typescript
const JsonSchema = z.json()

type JsonType = z.infer<typeof JsonSchema>
// Primitive types union (string | number | boolean | null) | JsonArray | JsonObject

// More specific types need custom schemas
```

## Serialization

```typescript
// Ensure output is JSON-serializable
const Serializable = z.json().transform(val => JSON.stringify(val))

// Round-trip validation
const RoundTrip = z.string()
  .transform(s => JSON.parse(s))
  .pipe(z.json())
  .transform(v => JSON.stringify(v))
```

## JSON vs Unknown

| Feature | z.json() | z.unknown() |
|---------|----------|-------------|
| Accepts undefined | ✗ | ✓ |
| Accepts functions | ✗ | ✓ |
| Accepts Symbols | ✗ | ✓ |
| Accepts Date | ✗ (unless in object) | ✓ |
| JSON-safe | ✓ | ✗ |

```typescript
// z.json() is more restrictive
z.json().parse(undefined) // ✗
z.unknown().parse(undefined) // ✓

// z.json() ensures JSON compatibility
const data = z.json().parse(input)
JSON.stringify(data) // Safe - won't throw
```

## Type Guard

```typescript
function isJsonValue(value: unknown): value is z.infer<typeof z.json> {
  const result = z.json().safeParse(value)
  return result.success
}
```

## JSON5 / Extended JSON

```typescript
// For extended JSON formats, use custom parser
import JSON5 from "json5"

const Json5Value = z.string()
  .transform((str, ctx) => {
    try {
      return JSON5.parse(str)
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON5"
      })
      return z.NEVER
    }
  })
  .pipe(z.json())
```

## Tips

1. **Use for dynamic data**: When structure isn't known at compile time
2. **Combines with transforms**: Parse strings, validate structure
3. **Not for unknown**: Use z.unknown() for truly any value
4. **JSON-serializable**: Guaranteed to work with JSON.stringify
5. **Database columns**: Perfect for JSON/JSONB columns
