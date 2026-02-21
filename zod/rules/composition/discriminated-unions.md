# Rule: Discriminated Unions

## Why It Matters

Discriminated unions use a common field (discriminator) to determine which schema to apply. This provides better performance than regular unions and cleaner type inference for tagged variants.

## Basic Usage

```typescript
import { z } from "zod"

// Discriminated union with "type" discriminator
const Event = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number(),
    y: z.number()
  }),
  z.object({
    type: z.literal("keypress"),
    key: z.string()
  }),
  z.object({
    type: z.literal("scroll"),
    direction: z.enum(["up", "down"])
  })
])

// Type inference
type Event = z.infer<typeof Event>
// { type: "click"; x: number; y: number }
// | { type: "keypress"; key: string }
// | { type: "scroll"; direction: "up" | "down" }
```

## Requirements

1. **Common discriminator field**: All variants must have the field
2. **Literal discriminator values**: Each variant must use z.literal()
3. **Unique discriminator values**: Each variant has different value

```typescript
// ✗ Invalid - missing discriminator in one variant
z.discriminatedUnion("type", [
  z.object({ type: z.literal("a") }),
  z.object({ value: z.string() }) // Missing "type"
])

// ✗ Invalid - non-literal discriminator
z.discriminatedUnion("type", [
  z.object({ type: z.string() }) // Must be literal
])

// ✓ Valid
z.discriminatedUnion("type", [
  z.object({ type: z.literal("a") }),
  z.object({ type: z.literal("b") })
])
```

## Accessing Options

```typescript
const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number() }),
  z.object({ type: z.literal("keypress"), key: z.string() })
])

// Get all options
Event.options // Array of ZodObject schemas

// Get discriminator field
Event.discriminator // "type"
```

## Common Patterns

### API Response Types

```typescript
const ApiResponse = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.object({
      id: z.string(),
      name: z.string()
    })
  }),
  z.object({
    status: z.literal("error"),
    error: z.object({
      code: z.number(),
      message: z.string()
    })
  })
])

// Narrow type based on status
const result = ApiResponse.parse(data)
if (result.status === "success") {
  console.log(result.data.name) // TypeScript knows shape
}
```

### Redux Actions

```typescript
const Action = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("INCREMENT"),
    payload: z.number()
  }),
  z.object({
    type: z.literal("DECREMENT"),
    payload: z.number()
  }),
  z.object({
    type: z.literal("RESET")
  })
])
```

### Event System

```typescript
const AppEvent = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("user.created"),
    userId: z.string(),
    timestamp: z.number()
  }),
  z.object({
    event: z.literal("user.deleted"),
    userId: z.string(),
    reason: z.string()
  }),
  z.object({
    event: z.literal("order.completed"),
    orderId: z.string(),
    amount: z.number()
  })
])
```

### WebSocket Messages

```typescript
const WSMessage = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("auth"),
    token: z.string()
  }),
  z.object({
    kind: z.literal("ping"),
    timestamp: z.number()
  }),
  z.object({
    kind: z.literal("data"),
    channel: z.string(),
    payload: z.unknown()
  })
])
```

### Payment Methods

```typescript
const PaymentMethod = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("credit_card"),
    cardNumber: z.string(),
    expiry: z.string(),
    cvv: z.string()
  }),
  z.object({
    type: z.literal("bank_transfer"),
    accountNumber: z.string(),
    routingNumber: z.string()
  }),
  z.object({
    type: z.literal("paypal"),
    email: z.string().email()
  })
])
```

### Form Field Types

```typescript
const FormField = z.discriminatedUnion("fieldType", [
  z.object({
    fieldType: z.literal("text"),
    name: z.string(),
    label: z.string(),
    placeholder: z.string().optional()
  }),
  z.object({
    fieldType: z.literal("select"),
    name: z.string(),
    label: z.string(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string()
    }))
  }),
  z.object({
    fieldType: z.literal("checkbox"),
    name: z.string(),
    label: z.string(),
    defaultChecked: z.boolean().optional()
  })
])
```

## Performance

Discriminated unions are faster than regular unions because they use a hash map lookup instead of trying each option:

```typescript
// Regular union - O(n) tries each option
const RegularUnion = z.union([...])

// Discriminated union - O(1) lookup by discriminator
const DiscriminatedUnion = z.discriminatedUnion("type", [...])
```

## Nested Discriminated Unions

```typescript
const Shape = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("circle"),
    radius: z.number()
  }),
  z.object({
    kind: z.literal("polygon"),
    type: z.enum(["triangle", "square", "pentagon"]),
    sides: z.number()
  })
])
```

## Type Narrowing

```typescript
const Result = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), value: z.number() }),
  z.object({ status: z.literal("error"), message: z.string() })
])

function handleResult(result: z.infer<typeof Result>) {
  // TypeScript narrows automatically
  if (result.status === "ok") {
    console.log(result.value) // number
  } else {
    console.log(result.message) // string
  }
}
```

## Type Inference

```typescript
const Union = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() })
])

type Union = z.infer<typeof Union>
// { type: "a"; value: string } | { type: "b"; value: number }

// Discriminator values are literal types
type Discriminator = Union["type"] // "a" | "b"
```

## Edge Cases

```typescript
// Missing discriminator value
z.discriminatedUnion("type", [
  z.object({ type: z.literal("a") })
]).parse({ type: "b" }) // ✗ throws

// Wrong discriminator field type
z.discriminatedUnion("type", [...])
  .parse({ type: 123 }) // ✗ throws (not string literal)
```

## Tips

1. **Use over regular unions**: Better performance and type inference
2. **Common in event systems**: Actions, messages, events
3. **Literal discriminators required**: Must use z.literal()
4. **All variants need discriminator**: Missing field throws schema error
5. **TypeScript narrowing works**: Automatic based on discriminator
