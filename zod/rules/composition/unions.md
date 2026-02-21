# Rule: Union Types

## Why It Matters

Unions allow values to be one of several types. Use for polymorphic data, optional values with null, and flexible APIs that accept multiple input formats.

## z.union()

Accepts any of the provided types.

```typescript
import { z } from "zod"

// String or number
const StringOrNumber = z.union([z.string(), z.number()])

StringOrNumber.parse("hello") // ✓
StringOrNumber.parse(42) // ✓
StringOrNumber.parse(true) // ✗ throws

// Type inference
type StringOrNumber = z.infer<typeof StringOrNumber> // string | number
```

## Union Syntax

```typescript
// Array syntax
const Union1 = z.union([z.string(), z.number()])

// .or() method chaining
const Union2 = z.string().or(z.number())

// Multiple .or() calls
const Multi = z.string()
  .or(z.number())
  .or(z.boolean())
```

## Accessing Options

```typescript
const Status = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("pending")
])

// Get all options
Status.options // [ZodLiteral("active"), ZodLiteral("inactive"), ZodLiteral("pending")]
```

## z.xor() (v4)

Exclusive or - value must match exactly one schema.

```typescript
// Must be A or B, but not both (for object unions)
const A = z.object({ a: z.string() })
const B = z.object({ b: z.number() })

const XorResult = z.xor(A, B)

// Passes: { a: "hello" }
// Passes: { b: 42 }
// Fails: { a: "hello", b: 42 } (matches both)
// Fails: {} (matches neither)
```

## Common Patterns

### String | Number

```typescript
const Id = z.union([z.string(), z.number()])
// Accepts "123" or 123
```

### Null or Value

```typescript
const OptionalString = z.union([z.string(), z.null()])
// Equivalent to z.string().nullable()
```

### Multiple Literals

```typescript
const Status = z.union([
  z.literal("success"),
  z.literal("error"),
  z.literal("warning")
])
// Equivalent to z.enum(["success", "error", "warning"])
```

### Polymorphic Result

```typescript
const Result = z.union([
  z.object({
    success: z.literal(true),
    data: z.string()
  }),
  z.object({
    success: z.literal(false),
    error: z.string()
  })
])

// Validates discriminated shapes
```

### Flexible Input

```typescript
const Input = z.union([
  z.string(),                          // String input
  z.number(),                          // Number input
  z.object({ value: z.string() })      // Object input
]).transform(val => {
  if (typeof val === "string") return val
  if (typeof val === "number") return String(val)
  return val.value
})
```

### API Response Union

```typescript
const ApiResponse = z.union([
  z.object({
    status: z.literal("success"),
    data: z.unknown()
  }),
  z.object({
    status: z.literal("error"),
    message: z.string(),
    code: z.number()
  })
])
```

### Primitive Union

```typescript
const Primitive = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
])

type Primitive = z.infer<typeof Primitive>
// string | number | boolean | null
```

## Union Ordering

Zod tries schemas in order. First match wins.

```typescript
// Order matters for overlapping types
const Union = z.union([
  z.string(),      // Tried first
  z.number()       // Tried second
])

// String "123" matches z.string(), not z.number()
```

### Ordering Example

```typescript
// For literals, order more specific first
const Port = z.union([
  z.literal(80),      // Specific
  z.literal(443),     // Specific
  z.number().int()    // General
])

Port.parse(80)    // Matches literal(80)
Port.parse(443)   // Matches literal(443)
Port.parse(8080)  // Matches number()
```

## Discriminated Union vs Union

Use discriminated unions when possible for better performance:

```typescript
// Regular union - tries each option
const Union = z.union([
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() })
])

// Discriminated union - uses discriminator for fast lookup
const Discriminated = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() })
])
```

## Type Inference

```typescript
// Basic union
const Union = z.union([z.string(), z.number()])
type U = z.infer<typeof Union> // string | number

// Object union
const ObjUnion = z.union([
  z.object({ a: z.string() }),
  z.object({ b: z.number() })
])
type OU = z.infer<typeof ObjUnion>
// { a: string } | { b: number }

// Literal union
const LitUnion = z.union([
  z.literal("a"),
  z.literal("b")
])
type LU = z.infer<typeof LitUnion> // "a" | "b"
```

## Edge Cases

```typescript
// Empty union is never
z.union([]) // Matches nothing

// Single element union is just that type
z.union([z.string()]) // Equivalent to z.string()

// Overlapping types
z.union([z.string(), z.string().min(5)])
// First match wins, second never reached
```

## Error Messages

```typescript
const Union = z.union([z.string(), z.number()], {
  errorMap: (issue, ctx) => {
    return { message: "Expected string or number" }
  }
})
```

## Tips

1. **Use discriminated unions** when there's a common discriminator field
2. **Order matters**: More specific schemas before general ones
3. **Prefer z.enum()** for literal string unions
4. **Use .or()** for cleaner two-type unions
5. **z.xor() for exclusivity**: When value must match exactly one
