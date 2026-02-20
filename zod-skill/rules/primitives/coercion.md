# Rule: Type Coercion

## Why It Matters

Coercion transforms input values to the expected type before validation. This is essential for form data, environment variables, URL parameters, and API inputs where values are often strings but need to be other types.

## Basic Coercion

```typescript
import { z } from "zod"

// Coerce to string
const CoercedString = z.coerce.string()

// Coerce to number
const CoercedNumber = z.coerce.number()

// Coerce to boolean
const CoercedBoolean = z.coerce.boolean()

// Coerce to bigint
const CoercedBigint = z.coerce.bigint()

// Coerce to date
const CoercedDate = z.coerce.date()
```

## z.coerce.string()

Converts any value to string using JavaScript's `String()`.

```typescript
z.coerce.string().parse(123) // "123"
z.coerce.string().parse(true) // "true"
z.coerce.string().parse(null) // "null"
z.coerce.string().parse(undefined) // "undefined"
z.coerce.string().parse({}) // "[object Object]"
z.coerce.string().parse([1, 2]) // "1,2"

// With validation
const CoercedNonEmpty = z.coerce.string().min(1)
z.coerce.string().min(1).parse(null) // ✗ fails ("null" is 4 chars, but...)
```

## z.coerce.number()

Converts value to number. Commonly used for form inputs.

```typescript
z.coerce.number().parse("123") // 123
z.coerce.number().parse("3.14") // 3.14
z.coerce.number().parse(123) // 123 (unchanged)
z.coerce.number().parse(true) // 1
z.coerce.number().parse(false) // 0
z.coerce.number().parse(null) // 0
z.coerce.number().parse([]) // 0

// With validation
const CoercedPositive = z.coerce.number().positive()
z.coerce.number().positive().parse("-5") // ✗ fails

const CoercedInt = z.coerce.number().int()
z.coerce.number().int().parse("3.14") // ✗ fails

// Invalid coercion results in NaN, which fails
z.coerce.number().parse("abc") // ✗ throws
z.coerce.number().parse(undefined) // ✗ throws (NaN)
```

## z.coerce.boolean()

Converts value to boolean using truthy/falsy evaluation.

```typescript
// Truthy values become true
z.coerce.boolean().parse(1) // true
z.coerce.boolean().parse("true") // true
z.coerce.boolean().parse("yes") // true
z.coerce.boolean().parse([1]) // true
z.coerce.boolean().parse({}) // true

// Falsy values become false
z.coerce.boolean().parse(0) // false
z.coerce.boolean().parse("") // false
z.coerce.boolean().parse(null) // false
z.coerce.boolean().parse(false) // false
z.coerce.boolean().parse([]) // false

// With default
const WithDefault = z.coerce.boolean().default(true)
```

## z.coerce.bigint()

Converts value to BigInt.

```typescript
z.coerce.bigint().parse("123") // 123n
z.coerce.bigint().parse(123) // 123n
z.coerce.bigint().parse(123n) // 123n

// With validation
const CoercedPositiveBigint = z.coerce.bigint().positive()
z.coerce.bigint().positive().parse("-5") // ✗ fails
```

## z.coerce.date()

Converts value to Date object.

```typescript
// ISO string
z.coerce.date().parse("2024-01-15") // Date object
z.coerce.date().parse("2024-01-15T10:30:00Z") // Date object

// Timestamp
z.coerce.date().parse(1705312200000) // Date object

// Date object (unchanged)
z.coerce.date().parse(new Date()) // Date object

// With validation
const FutureCoercedDate = z.coerce.date().min(new Date())
```

## Common Patterns

### Environment Variables

```typescript
const Env = z.object({
  // String (no coercion needed for env vars)
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),

  // Numbers from string env vars
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(100),

  // Booleans from string env vars
  DEBUG: z.coerce.boolean().default(false),
  ENABLE_CACHE: z.coerce.boolean().default(true),

  // Date from timestamp string
  START_DATE: z.coerce.date().optional()
})

// Usage with process.env
const env = Env.parse(process.env)
```

### Form Data / Query Params

```typescript
const QuerySchema = z.object({
  // String params
  search: z.string().optional(),

  // Number params
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Boolean params
  includeDeleted: z.coerce.boolean().default(false),
  verbose: z.coerce.boolean().optional(),

  // Date params
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
})
```

### API Input

```typescript
const CreateItemSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().nonnegative().default(1),
  isActive: z.coerce.boolean().default(true),
  expiresAt: z.coerce.date().optional()
})
```

### URL Search Params

```typescript
// URL: /api/users?page=2&limit=10&active=true&sort=name
const ParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  active: z.coerce.boolean().optional(),
  sort: z.string().default("createdAt")
})

const params = ParamsSchema.parse(Object.fromEntries(url.searchParams))
```

## Coercion vs Transform

```typescript
// Coercion (built-in, validates after coercion)
const CoercedNumber = z.coerce.number().positive()
z.coerce.number().positive().parse("5") // 5 ✓
z.coerce.number().positive().parse("-5") // ✗ fails validation

// Transform (manual coercion)
const TransformedNumber = z.string().transform(s => Number(s))
z.string().transform(s => Number(s)).parse("5") // 5
z.string().transform(s => Number(s)).parse("abc") // NaN (no validation)

// Prefer coercion for validation
const SafeNumber = z.coerce.number() // Validates result is valid number
```

## Edge Cases

```typescript
// Empty string to number
z.coerce.number().parse("") // ✗ throws (NaN)

// Whitespace string
z.coerce.number().parse("  123  ") // 123 (trimmed by Number())
z.coerce.number().parse("  ") // ✗ throws (NaN)

// Array to number
z.coerce.number().parse([123]) // 123
z.coerce.number().parse([1, 2]) // ✗ throws (NaN)

// Object to string
z.coerce.string().parse({ a: 1 }) // "[object Object]"

// null handling
z.coerce.number().parse(null) // 0
z.coerce.boolean().parse(null) // false
z.coerce.string().parse(null) // "null"
```

## Type Inference

```typescript
const schema = z.coerce.number()
type Inferred = z.infer<typeof schema> // number

// Coercion doesn't change the inferred type
const CoercedDate = z.coerce.date()
type DateType = z.infer<typeof CoercedDate> // Date
```

## Tips

1. **Use for form/query input**: Handles string inputs from forms and URLs
2. **Chain with validation**: Add `.int()`, `.positive()`, etc. after coercion
3. **Combine with defaults**: `.default()` for optional params
4. **Watch edge cases**: Empty strings, null, and undefined behavior
5. **Prefer coercion over preprocess**: Cleaner syntax for simple type conversion
