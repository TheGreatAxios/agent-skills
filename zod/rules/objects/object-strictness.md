# Rule: Object Strictness

## Why It Matters

Object strictness controls how Zod handles unknown properties. The right strictness level balances data integrity (rejecting unexpected data) with flexibility (allowing forward-compatible schemas).

## Default Behavior

By default, Zod strips unknown keys:

```typescript
import { z } from "zod"

const User = z.object({
  name: z.string(),
  email: z.string().email()
})

// Unknown keys are stripped
User.parse({ name: "John", email: "john@example.com", extra: "ignored" })
// Result: { name: "John", email: "john@example.com" }
```

## Strictness Methods

| Method | Behavior | Unknown Keys |
|--------|----------|--------------|
| `.strict()` | Reject unknown | Throws error |
| `.passthrough()` | Allow unknown | Kept in output |
| `.strip()` | Remove unknown | Silently removed |
| `.catchall()` | Validate unknown | Must match schema |

## z.strictObject()

Create object that rejects unknown keys by default.

```typescript
const StrictUser = z.strictObject({
  name: z.string(),
  email: z.string().email()
})

// These pass:
StrictUser.parse({ name: "John", email: "john@example.com" })

// This fails:
StrictUser.parse({ name: "John", email: "john@example.com", extra: "data" })
// ZodError: Unrecognized key(s) in object: 'extra'
```

## .strict()

Convert existing object to strict mode.

```typescript
const User = z.object({
  name: z.string()
}).strict()

// Equivalent to z.strictObject()
User.parse({ name: "John", extra: "data" }) // ✗ throws
```

## .passthrough()

Allow unknown keys to pass through.

```typescript
const User = z.object({
  name: z.string()
}).passthrough()

// Unknown keys are preserved
const result = User.parse({ name: "John", extra: "data", more: 123 })
// { name: "John", extra: "data", more: 123 }
```

## .strip()

Remove unknown keys (default behavior, explicit form).

```typescript
const User = z.object({
  name: z.string()
}).strip()

// Unknown keys are removed
const result = User.parse({ name: "John", extra: "removed" })
// { name: "John" }
```

## .catchall()

Validate unknown keys against a schema.

```typescript
// Unknown keys must be strings
const User = z.object({
  name: z.string()
}).catchall(z.string())

// Passes: all unknown keys are strings
User.parse({ name: "John", extra: "data", more: "info" })

// Fails: unknown key is not string
User.parse({ name: "John", count: 123 })
// ZodError at "count": Expected string
```

### Catchall with Complex Schema

```typescript
// Unknown keys must match specific schema
const Config = z.object({
  name: z.string()
}).catchall(z.union([
  z.string(),
  z.number(),
  z.boolean()
]))

// Passes
Config.parse({ name: "app", debug: true, version: 1.0, env: "prod" })
```

## z.looseObject()

Alias for object with passthrough behavior.

```typescript
const LooseUser = z.looseObject({
  name: z.string()
})

// Equivalent to:
const LooseUserAlt = z.object({ name: z.string() }).passthrough()

// Unknown keys preserved
LooseUser.parse({ name: "John", anything: "goes" })
// { name: "John", anything: "goes" }
```

## Strictness Comparison

```typescript
const BaseSchema = z.object({ id: z.string() })

// Strip (default)
const Strip = BaseSchema
Strip.parse({ id: "1", extra: "x" }) // { id: "1" }

// Strict
const Strict = BaseSchema.strict()
Strict.parse({ id: "1", extra: "x" }) // ✗ throws

// Passthrough
const Passthrough = BaseSchema.passthrough()
Passthrough.parse({ id: "1", extra: "x" }) // { id: "1", extra: "x" }

// Catchall
const Catchall = BaseSchema.catchall(z.string())
Catchall.parse({ id: "1", extra: "x" }) // { id: "1", extra: "x" }
Catchall.parse({ id: "1", extra: 123 }) // ✗ throws
```

## Common Patterns

### API Input (Strict)

```typescript
// Reject unexpected fields for security
const CreateInput = z.strictObject({
  name: z.string(),
  email: z.string().email()
})

// Prevents injection of unintended fields
CreateInput.parse({
  name: "John",
  email: "john@example.com",
  isAdmin: true // ✗ rejected
})
```

### Webhook Payload (Passthrough)

```typescript
// Accept all webhook fields, validate only known ones
const WebhookPayload = z.object({
  event: z.string(),
  timestamp: z.number()
}).passthrough()

// Preserves all webhook data for logging/debugging
```

### Config File (Catchall)

```typescript
// Extra config must be valid types
const Config = z.object({
  name: z.string(),
  version: z.string()
}).catchall(z.union([z.string(), z.number(), z.boolean()]))
```

### Legacy Compatibility (Loose)

```typescript
// Accept any shape, validate only expected fields
const LegacyAPI = z.looseObject({
  id: z.string(),
  type: z.string()
})
```

## Strictness Inheritance

```typescript
const Base = z.object({ id: z.string() }).strict()

// Derived schemas inherit strictness
const Extended = Base.extend({ name: z.string() })
Extended.parse({ id: "1", name: "John", extra: "x" }) // ✗ throws

// Override strictness
const Lenient = Base.extend({ name: z.string() }).passthrough()
Lenient.parse({ id: "1", name: "John", extra: "x" }) // ✓ passes
```

## Error Messages

```typescript
const Strict = z.object({ name: z.string() }).strict()

try {
  Strict.parse({ name: "John", extra: "data" })
} catch (error) {
  // error.issues[0].message includes:
  // "Unrecognized key(s) in object: 'extra'"
}
```

## Type Inference

```typescript
// All produce same type inference for known keys
const Strict = z.strictObject({ name: z.string() })
const Loose = z.looseObject({ name: z.string() })

type StrictType = z.infer<typeof Strict> // { name: string }
type LooseType = z.infer<typeof Loose>   // { name: string }

// Passthrough doesn't add index signature to type
const Passthrough = z.object({ name: z.string() }).passthrough()
type PassthroughType = z.infer<typeof Passthrough> // { name: string }
// Unknown keys exist at runtime but not in type
```

## Tips

1. **Use strict for API input**: Prevent unexpected field injection
2. **Use passthrough for webhooks/events**: Preserve all data
3. **Use catchall for configs**: Validate extra field types
4. **Default strip is safe**: Explicit strictness documents intent
5. **Consider serialization**: Passthrough may include unwanted data
