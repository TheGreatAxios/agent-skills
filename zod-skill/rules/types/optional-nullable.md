# Rule: Optional and Nullable

## Why It Matters

Optionality controls whether values can be missing or null. Understanding the difference between optional, nullable, and nullish is crucial for accurate type inference and validation.

## .optional()

Allows `undefined` as a valid value.

```typescript
import { z } from "zod"

// Optional string
const OptionalName = z.string().optional()

OptionalName.parse("hello")    // ✓ "hello"
OptionalName.parse(undefined)  // ✓ undefined
OptionalName.parse(null)       // ✗ null not allowed

// Type inference
type OptionalName = z.infer<typeof OptionalName> // string | undefined
```

## .nullable()

Allows `null` as a valid value.

```typescript
// Nullable string
const NullableName = z.string().nullable()

NullableName.parse("hello")  // ✓ "hello"
NullableName.parse(null)     // ✓ null
NullableName.parse(undefined) // ✗ undefined not allowed

// Type inference
type NullableName = z.infer<typeof NullableName> // string | null
```

## .nullish()

Allows both `null` and `undefined`.

```typescript
// Nullish string
const NullishName = z.string().nullish()

NullishName.parse("hello")    // ✓ "hello"
NullishName.parse(null)       // ✓ null
NullishName.parse(undefined)  // ✓ undefined

// Type inference
type NullishName = z.infer<typeof NullishName> // string | null | undefined
```

## Comparison Table

| Method | Allows undefined | Allows null | Type Inference |
|--------|------------------|-------------|----------------|
| (none) | ✗ | ✗ | `T` |
| `.optional()` | ✓ | ✗ | `T \| undefined` |
| `.nullable()` | ✗ | ✓ | `T \| null` |
| `.nullish()` | ✓ | ✓ | `T \| null \| undefined` |

## .unwrap()

Remove optional/nullable wrapper.

```typescript
const OptionalString = z.string().optional()
const RequiredString = OptionalString.unwrap()
// z.string()

const NullableString = z.string().nullable()
const NonNullString = NullableString.unwrap()
// z.string()
```

## Chaining Order

```typescript
// Order doesn't affect the result type
const A = z.string().optional().nullable() // string | null | undefined
const B = z.string().nullable().optional() // string | null | undefined

// Both equivalent to .nullish()
```

## Object Property Optionality

```typescript
const User = z.object({
  id: z.string(),                    // Required
  name: z.string(),                  // Required
  email: z.string().optional(),      // Optional (string | undefined)
  phone: z.string().nullable(),      // Nullable (string | null)
  nickname: z.string().nullish(),    // Nullish (string | null | undefined)
  bio: z.string().optional().nullable() // Both (string | null | undefined)
})

// Object with all optional
const PartialUser = User.partial()
// All fields become optional

// Make specific fields optional
const PartialName = User.partial({ name: true })
```

## With Default Values

```typescript
// Optional with default
const WithDefault = z.string().optional().default("default")

WithDefault.parse(undefined) // "default"
WithDefault.parse("hello")   // "hello"

// Note: type is string, not string | undefined
type WithDefault = z.infer<typeof WithDefault> // string
```

## Arrays and Optionality

```typescript
// Optional array (array can be undefined)
const OptionalArray = z.array(z.string()).optional()

// Array of optional (elements can be undefined)
const ArrayOfOptional = z.array(z.string().optional())

// Nullable array
const NullableArray = z.array(z.string()).nullable()
```

## Common Patterns

### API Response

```typescript
const ApiResponse = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),     // May be missing on error
  error: z.string().nullable(),     // Null on success
  message: z.string().nullish()     // Optional and nullable
})
```

### User Profile

```typescript
const Profile = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().nullable(),      // User may not have phone
  avatar: z.string().url().optional(), // Optional field
  bio: z.string().nullish(),         // Either provided, null, or missing
  website: z.string().url().optional().nullable()
})
```

### Environment Variables

```typescript
const Env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),  // Optional dependency
  SENTRY_DSN: z.string().nullable()  // May be explicitly null
})
```

### Update Payloads

```typescript
const CreatePayload = z.object({
  name: z.string(),
  email: z.string().email()
})

const UpdatePayload = CreatePayload.partial()
// All fields optional for partial updates

// Or make specific fields optional
const PartialUpdate = CreatePayload.partial({
  name: true,
  email: true
})
```

## Extraction Methods

```typescript
const schema = z.string().optional()

// Check if schema is optional
schema.isOptional() // true

// Get inner type
schema.unwrap() // z.string()
```

## Transforming Optional Values

```typescript
// Transform only if present
const TrimmedOptional = z.string()
  .optional()
  .transform(val => val?.trim())

// Provide default during transform
const WithDefault = z.string()
  .optional()
  .transform(val => val ?? "default")

// Filter null
const FilteredNull = z.string()
  .nullable()
  .transform(val => val ?? undefined)
```

## JSON Serialization

```typescript
// undefined is omitted from JSON, null is preserved
const Data = z.object({
  name: z.string().optional(),
  value: z.string().nullable()
})

const result = Data.parse({ name: undefined, value: null })
// result: { value: null }  (name omitted)

JSON.stringify(result) // '{"value":null}'
```

## TypeScript Exact Optional Properties

```typescript
// With exactOptionalPropertyTypes: true
// { name?: string } allows undefined but not assignment of { name: undefined }

const Schema = z.object({
  name: z.string().optional()
})

// Parse behavior:
Schema.parse({})           // ✓
Schema.parse({ name: "a" }) // ✓
Schema.parse({ name: undefined }) // ✓ at runtime

// But TypeScript might differ with exactOptionalPropertyTypes
```

## Tips

1. **Use optional for missing values**: When field may not be provided
2. **Use nullable for explicit null**: When null has semantic meaning
3. **Use nullish for flexible input**: Accepts both null and undefined
4. **Combine with default**: `.optional().default()` for required output
5. **Partial objects**: Use `.partial()` for update schemas
