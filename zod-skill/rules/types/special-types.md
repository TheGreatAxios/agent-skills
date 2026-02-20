# Rule: Special Types

## Why It Matters

Special types handle edge cases like any, unknown, never, void, and NaN. These provide escape hatches and type safety boundaries in schemas.

## z.any()

Accepts any value, disables type checking.

```typescript
import { z } from "zod"

const Anything = z.any()

Anything.parse("string")  // ✓
Anything.parse(123)       // ✓
Anything.parse(null)      // ✓
Anything.parse(undefined) // ✓
Anything.parse({})        // ✓

// Type inference
type Anything = z.infer<typeof Anything> // any
```

**Use Cases**
- Migration from untyped code
- Gradual typing
- Interfacing with truly dynamic data

**Warning**: Disables TypeScript checking. Use sparingly.

## z.unknown()

Accepts any value, but requires type narrowing to use.

```typescript
const Unknown = z.unknown()

Unknown.parse("anything") // ✓

// Type inference
type Unknown = z.infer<typeof Unknown> // unknown

// Must narrow before use
function process(value: unknown) {
  if (typeof value === "string") {
    console.log(value.toUpperCase()) // ✓
  }
}
```

**Use Cases**
- Safer alternative to `any`
- Input from untrusted sources
- Values requiring runtime type checking

## z.never()

Accepts no values. Always fails validation.

```typescript
const Never = z.never()

Never.parse("anything") // ✗ always throws

// Type inference
type Never = z.infer<typeof Never> // never
```

**Use Cases**
- Exhaustive type checking
- Impossible branches in unions
- Type system assertions

```typescript
// Exhaustive switch
type Shape = "circle" | "square"

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI
    case "square": return 1
    default:
      const _exhaustive: never = shape
      return _exhaustive
  }
}

// In schema - impossible union member
const ImpossibleUnion = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.never() }) // b has no value
])
```

## z.void()

Accepts `undefined` only. Matches TypeScript `void` type.

```typescript
const Void = z.void()

Void.parse(undefined) // ✓
Void.parse(null)      // ✗
Void.parse("value")   // ✗

// Type inference
type Void = z.infer<typeof Void> // void
```

**Use Cases**
- Function return types
- Callbacks without return values
- API that returns nothing

```typescript
// Function schema with void return
const Callback = z.function()
  .args(z.string())
  .returns(z.void())
```

## z.nan()

Accepts only `NaN` (Not a Number).

```typescript
const Nan = z.nan()

Nan.parse(NaN)     // ✓
Nan.parse(123)     // ✗
Nan.parse("NaN")   // ✗
Nan.parse(null)    // ✗

// Type inference
type Nan = z.infer<typeof Nan> // typeof NaN
```

**Use Cases**
- Representing invalid numeric results
- Sentinel values
- Edge case handling

```typescript
// Number or NaN
const NumberOrNaN = z.union([z.number(), z.nan()])

// Mark failed calculations
const Calculation = z.number().transform(n => {
  if (n < 0) return NaN
  return Math.sqrt(n)
})
```

## z.undefined()

Accepts only `undefined`.

```typescript
const Undefined = z.undefined()

Undefined.parse(undefined) // ✓
Undefined.parse(null)      // ✗
Undefined.parse("value")   // ✗

// Type inference
type Undefined = z.infer<typeof Undefined> // undefined
```

**Use Cases**
- Explicit undefined fields
- Object property deletion markers
- Optional field handling

## z.null()

Accepts only `null`.

```typescript
const Null = z.null()

Null.parse(null)      // ✓
Null.parse(undefined) // ✗
Null.parse("value")   // ✗

// Type inference
type Null = z.infer<typeof Null> // null
```

## Comparison Table

| Type | Accepts | TypeScript Type |
|------|---------|-----------------|
| `z.any()` | Everything | `any` |
| `z.unknown()` | Everything | `unknown` |
| `z.never()` | Nothing | `never` |
| `z.void()` | `undefined` | `void` |
| `z.null()` | `null` | `null` |
| `z.undefined()` | `undefined` | `undefined` |
| `z.nan()` | `NaN` | `number` |

## Common Patterns

### Optional Union

```typescript
// Explicit null | undefined
const Nullish = z.union([z.null(), z.undefined()])

// Same as
const NullishAlt = z.null().or(z.undefined())
```

### Function Return Types

```typescript
// Void return
const VoidFunction = z.function()
  .args(z.string())
  .returns(z.void())

// Any return
const AnyFunction = z.function()
  .args()
  .returns(z.any())

// Unknown return (safer)
const UnknownFunction = z.function()
  .args()
  .returns(z.unknown())
```

### Exhaustive Handling

```typescript
type Event = "click" | "keypress" | "scroll"

const EventHandler = z.object({
  event: z.enum(["click", "keypress", "scroll"]),
  handler: z.function()
    .args(z.unknown())
    .returns(z.union([z.void(), z.promise(z.void())]))
})
```

### API Response Patterns

```typescript
// Success or error
const ApiResponse = z.union([
  z.object({
    success: z.literal(true),
    data: z.unknown()
  }),
  z.object({
    success: z.literal(false),
    error: z.string()
  })
])

// Nullable data
const NullableResponse = z.object({
  data: z.unknown().nullable(),
  error: z.string().optional()
})
```

## Type Safety Escapes

```typescript
// When you need to escape type checking temporarily
const LegacySchema = z.object({
  data: z.any(), // TODO: Type this properly
  metadata: z.record(z.any())
})

// Migrate to unknown for safety
const SaferSchema = z.object({
  data: z.unknown(),
  metadata: z.record(z.unknown())
})
```

## Tips

1. **Prefer unknown over any**: Safer with same flexibility
2. **Use never for exhaustiveness**: Compile-time guarantees
3. **void for function returns**: Matches TS conventions
4. **null vs undefined**: Be explicit about which you expect
5. **nan edge cases**: Only accepts actual NaN value
