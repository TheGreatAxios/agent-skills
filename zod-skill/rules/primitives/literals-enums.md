# Rule: Literals and Enums

## Why It Matters

Literals and enums constrain values to specific options. Use for status fields, types, roles, and any field with a fixed set of valid values.

## z.literal()

Accepts exactly one specific value.

```typescript
import { z } from "zod"

// String literal
const StatusActive = z.literal("active")

// Number literal
const StatusCode = z.literal(200)

// Boolean literal
const TrueValue = z.literal(true)

// BigInt literal
const ZeroBigint = z.literal(0n)
```

**Valid Values**
```typescript
z.literal("active").parse("active") // ✓
z.literal("active").parse("inactive") // ✗ throws
z.literal(200).parse(200) // ✓
z.literal(200).parse(201) // ✗ throws
```

### Literal Type Inference

```typescript
const status = z.literal("active")
type Status = z.infer<typeof status> // "active" (literal type)

const code = z.literal(200)
type Code = z.infer<typeof code> // 200
```

### Union of Literals

```typescript
// Multiple allowed values
const Status = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("pending")
])

// Alternative syntax with .or()
const StatusAlt = z.literal("active")
  .or(z.literal("inactive"))
  .or(z.literal("pending"))
```

## z.enum()

Accepts one of several string values. Cleaner syntax than union of literals.

```typescript
// Basic enum
const Status = z.enum(["active", "inactive", "pending"])

// With type inference
type Status = z.infer<typeof Status> // "active" | "inactive" | "pending"
```

**Valid Values**
```typescript
z.enum(["a", "b", "c"]).parse("a") // ✓
z.enum(["a", "b", "c"]).parse("d") // ✗ throws
```

### Accessing Enum Values

```typescript
const Role = z.enum(["admin", "user", "guest"])

// Get all values as array
Role.options // ["admin", "user", "guest"]

// Get values as union type
type RoleType = typeof Role.enum
// { admin: "admin", user: "user", guest: "guest" }
```

### Extracting Values

```typescript
// TypeScript enum-like usage
const Role = z.enum(["admin", "user", "guest"])
type Role = z.infer<typeof Role>

// Use in code
function getPermissions(role: Role): string[] {
  switch (role) {
    case Role.enum.admin: return ["read", "write", "delete"]
    case Role.enum.user: return ["read", "write"]
    case Role.enum.guest: return ["read"]
  }
}
```

### Custom Error Messages

```typescript
const Status = z.enum(["active", "inactive"], {
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
      return { message: "Invalid status. Must be 'active' or 'inactive'" }
    }
    return { message: ctx.defaultError }
  }
})
```

## Enum Methods

### .exclude()

Remove values from enum.

```typescript
const Status = z.enum(["active", "inactive", "pending"])

// Exclude one value
const ActiveOrInactive = Status.exclude(["pending"])
type ActiveOrInactive = z.infer<typeof ActiveOrInactive> // "active" | "inactive"

// Exclude multiple values
const OnlyActive = Status.exclude(["inactive", "pending"])
type OnlyActive = z.infer<typeof OnlyActive> // "active"
```

### .extract()

Keep only specified values.

```typescript
const Status = z.enum(["active", "inactive", "pending", "deleted"])

// Extract subset
const ActiveStatuses = Status.extract(["active", "pending"])
type ActiveStatuses = z.infer<typeof ActiveStatuses> // "active" | "pending"
```

## Common Patterns

### Status Fields

```typescript
const OrderStatus = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
])

const Order = z.object({
  id: z.string().uuid(),
  status: OrderStatus,
  createdAt: z.date()
})
```

### Role-Based Access

```typescript
const Role = z.enum(["admin", "manager", "user", "guest"])

const User = z.object({
  id: z.string(),
  email: z.string().email(),
  role: Role.default("user")
})
```

### API Response Types

```typescript
const ResponseStatus = z.enum(["success", "error", "warning"])

const ApiResponse = z.object({
  status: ResponseStatus,
  message: z.string(),
  data: z.unknown().optional()
})
```

### Environment

```typescript
const NodeEnv = z.enum(["development", "production", "test", "staging"])

const Env = z.object({
  NODE_ENV: NodeEnv.default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
})
```

### Type Discriminator

```typescript
// Used in discriminated unions
const ClickEvent = z.object({
  type: z.literal("click"),
  x: z.number(),
  y: z.number()
})

const KeyEvent = z.object({
  type: z.literal("keypress"),
  key: z.string()
})

const Event = z.discriminatedUnion("type", [ClickEvent, KeyEvent])
```

## Native Enums

Zod can validate TypeScript native enums.

```typescript
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue"
}

// Validate native enum
const ColorSchema = z.nativeEnum(Color)

z.nativeEnum(Color).parse(Color.Red) // ✓
z.nativeEnum(Color).parse("red") // ✓
z.nativeEnum(Color).parse("yellow") // ✗ throws
```

### Numeric Enums

```typescript
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404
}

const StatusSchema = z.nativeEnum(HttpStatus)

z.nativeEnum(HttpStatus).parse(200) // ✓
z.nativeEnum(HttpStatus).parse(HttpStatus.OK) // ✓
```

### Const Object as Enum

```typescript
const FRUITS = {
  Apple: "apple",
  Banana: "banana",
  Cherry: "cherry"
} as const

// Validate against const object values
const FruitSchema = z.nativeEnum(FRUITS)

z.nativeEnum(FRUITS).parse("apple") // ✓
z.nativeEnum(FRUITS).parse("orange") // ✗ throws
```

## Literal vs Enum

| Feature | z.literal() | z.enum() |
|---------|-------------|----------|
| Single value | ✓ | ✗ |
| Multiple values | Union needed | Built-in |
| Type inference | Literal type | Union of literals |
| Methods | None | exclude, extract |
| Ergonomics | Verbose for multiple | Cleaner syntax |

```typescript
// These are equivalent:

// Using literals
const StatusLiteral = z.union([
  z.literal("active"),
  z.literal("inactive")
])

// Using enum (preferred)
const StatusEnum = z.enum(["active", "inactive"])
```

## Tips

1. **Use z.enum() for multiple options**: Cleaner than union of literals
2. **Use .exclude()/.extract()**: Derive sub-enums without duplication
3. **Access via .enum**: Get TypeScript-friendly enum object
4. **Native enums**: Use z.nativeEnum() for TypeScript enums
5. **Discriminated unions**: Use literals for type discriminators
