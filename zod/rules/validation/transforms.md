# Rule: Transforms

## Why It Matters

Transforms modify data after validation. Use for normalization, type conversion, computed fields, and formatting output data.

## .transform()

Modify the value after validation.

```typescript
import { z } from "zod"

// String to uppercase
const Uppercase = z.string().transform(val => val.toUpperCase())

Uppercase.parse("hello") // "HELLO"

// Type changes
const StringToNumber = z.string().transform(val => parseInt(val, 10))

type Input = z.input<typeof StringToNumber>  // string
type Output = z.infer<typeof StringToNumber> // number
```

## Common Transforms

### String Normalization

```typescript
// Trim and lowercase email
const Email = z.string()
  .email()
  .transform(val => val.trim().toLowerCase())

// Remove spaces
const NoSpaces = z.string()
  .transform(val => val.replace(/\s/g, ""))
```

### Type Conversion

```typescript
// String to number
const ToNumber = z.string().transform(s => Number(s))

// String to Date
const ToDate = z.string().datetime().transform(s => new Date(s))

// String to array
const ToArray = z.string().transform(s => s.split(","))

// Array to string
const ToString = z.array(z.string()).transform(arr => arr.join(","))
```

### Object Transformation

```typescript
const User = z.object({
  firstName: z.string(),
  lastName: z.string()
}).transform(({ firstName, lastName }) => ({
  firstName,
  lastName,
  fullName: `${firstName} ${lastName}`
}))

User.parse({ firstName: "John", lastName: "Doe" })
// { firstName: "John", lastName: "Doe", fullName: "John Doe" }
```

### Array Operations

```typescript
// Sort array
const Sorted = z.array(z.number())
  .transform(arr => [...arr].sort((a, b) => a - b))

// Unique values
const Unique = z.array(z.string())
  .transform(arr => [...new Set(arr)])

// Filter
const NonEmpty = z.array(z.string())
  .transform(arr => arr.filter(s => s.length > 0))

// Map values
const Upper = z.array(z.string())
  .transform(arr => arr.map(s => s.toUpperCase()))
```

### Default Values

```typescript
const WithDefaults = z.object({
  name: z.string(),
  active: z.boolean().optional()
}).transform(data => ({
  name: data.name,
  active: data.active ?? true
}))
```

## .overwrite() (v4)

Replace value without changing type.

```typescript
// v4 syntax
const Normalized = z.string().overwrite((val) => val.trim().toLowerCase())

// Similar to transform but type remains string
```

## Chaining Transforms

```typescript
const Processed = z.string()
  .transform(s => s.trim())          // First: trim
  .transform(s => s.toLowerCase())   // Second: lowercase
  .transform(s => s.replace(/\s+/g, "-")) // Third: replace spaces

Processed.parse("  Hello World  ") // "hello-world"
```

## Transform with Validation

```typescript
// Validate, then transform
const ValidatedEmail = z.string()
  .email()                          // Validate first
  .transform(s => s.toLowerCase())  // Then transform

// Transform output still validated
const NumberFromString = z.string()
  .transform(s => Number(s))
  .refine(n => n > 0, "Must be positive")
```

## Accessing Context in Transform

```typescript
const WithPath = z.string().transform((val, ctx) => {
  // ctx contains parsing context
  console.log(ctx.path) // Current path in schema
  return val.toUpperCase()
})
```

## Async Transforms

```typescript
const WithAsyncData = z.string().transform(async (id) => {
  const user = await fetchUser(id)
  return user
})

// Use parseAsync
const result = await WithAsyncData.parseAsync("user123")
```

## Common Patterns

### API Input Normalization

```typescript
const CreateInput = z.object({
  email: z.string().email().transform(e => e.toLowerCase()),
  name: z.string().transform(n => n.trim()),
  phone: z.string()
    .transform(p => p.replace(/\D/g, ""))
    .transform(p => `+1${p}`)
})
```

### Search Query

```typescript
const SearchQuery = z.object({
  q: z.string().transform(s => s.trim().toLowerCase()),
  tags: z.string()
    .transform(s => s.split(",").map(t => t.trim()))
    .optional()
})
```

### Pagination Defaults

```typescript
const Pagination = z.object({
  page: z.coerce.number().int().positive().transform(p => p - 1), // 0-indexed
  limit: z.coerce.number().int().min(1).max(100).default(20)
})
```

### Date Handling

```typescript
const DateInput = z.string()
  .datetime()
  .transform(s => new Date(s))
  .transform(d => d.toISOString())
```

### Computed Fields

```typescript
const Order = z.object({
  items: z.array(z.object({
    price: z.number(),
    quantity: z.number().int()
  }))
}).transform(data => ({
  ...data,
  total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}))
```

### Redaction/Masking

```typescript
const UserResponse = z.object({
  email: z.string().email(),
  password: z.string()
}).transform(({ password, ...rest }) => ({
  ...rest,
  password: "***"
}))
```

## Input vs Output Types

```typescript
const Schema = z.object({
  input: z.string(),
  output: z.string().transform(s => s.toUpperCase())
})

// Input type (what parse accepts)
type Input = z.input<typeof Schema>
// { input: string; output: string }

// Output type (what parse returns)
type Output = z.infer<typeof Schema>
// { input: string; output: string } (output is still string, just uppercased)

// When type changes:
const NumFromString = z.string().transform(s => Number(s))
type NInput = z.input<typeof NumFromString>  // string
type NOutput = z.infer<typeof NumFromString> // number
```

## Tips

1. **Chain transforms**: Each transform runs in order
2. **Validate before transform**: Catch errors early
3. **Use for normalization**: Trim, lowercase, format
4. **Consider input/output types**: Transform may change types
5. **Async requires parseAsync**: Use async transform with async parse
