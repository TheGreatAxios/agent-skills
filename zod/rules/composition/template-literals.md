# Rule: Template Literals

## Why It Matters

Template literal schemas validate strings matching specific patterns with interpolated schemas. Use for URLs, paths, identifiers, and any string with a known format.

## Basic Usage

```typescript
import { z } from "zod"

// Static template literal (equivalent to literal)
const Static = z.templateLiteral(["hello"])

Static.parse("hello") // ✓
Static.parse("world") // ✗
```

## With Interpolation

```typescript
// String interpolation
const Greeting = z.templateLiteral([
  "Hello, ",
  z.string(),
  "!"
])

Greeting.parse("Hello, World!") // ✓
Greeting.parse("Hello, Alice!") // ✓
Greeting.parse("Hi, World!") // ✗
```

## Common Patterns

### URL Paths

```typescript
// /users/{userId}
const UserPath = z.templateLiteral([
  "/users/",
  z.string().uuid()
])

UserPath.parse("/users/123e4567-e89b-12d3-a456-426614174000") // ✓
UserPath.parse("/users/abc") // ✗
```

### API Endpoints

```typescript
// /api/v{version}/{resource}/{id}
const ApiPath = z.templateLiteral([
  "/api/v",
  z.number().int(),
  "/",
  z.string(),
  "/",
  z.string().uuid()
])

ApiPath.parse("/api/v1/users/123e4567-e89b-12d3-a456-426614174000") // ✓
```

### Prefixed IDs

```typescript
// user_{uuid}
const UserId = z.templateLiteral([
  "user_",
  z.string().uuid()
])

// order_{number}
const OrderId = z.templateLiteral([
  "order_",
  z.string().regex(/^\d+$/)
])

// Custom ID format
const CustomId = z.templateLiteral([
  z.enum(["usr", "org", "prj"]),
  "_",
  z.string().ulid()
])
```

### Version Strings

```typescript
// v{major}.{minor}.{patch}
const Version = z.templateLiteral([
  "v",
  z.number().int().nonnegative(),
  ".",
  z.number().int().nonnegative(),
  ".",
  z.number().int().nonnegative()
])

Version.parse("v1.2.3") // ✓
Version.parse("1.2.3") // ✗ (missing v)
Version.parse("v1.2") // ✗ (missing patch)
```

### Color Hex

```typescript
// #{hex}
const HexColor = z.templateLiteral([
  "#",
  z.string().regex(/^[0-9a-fA-F]{6}$/)
])

// Or with length constraint
const HexColorAlt = z.templateLiteral([
  "#",
  z.string().length(6).regex(/^[0-9a-fA-F]+$/)
])

HexColor.parse("#ff0000") // ✓
HexColor.parse("#FF0000") // ✓
HexColor.parse("ff0000") // ✗ (missing #)
```

### File Extensions

```typescript
// filename.{ext}
const ImageFile = z.templateLiteral([
  z.string().min(1),
  ".",
  z.enum(["jpg", "jpeg", "png", "gif", "webp"])
])

ImageFile.parse("photo.jpg") // ✓
ImageFile.parse("image.png") // ✓
ImageFile.parse("document.pdf") // ✗
```

### Date Format

```typescript
// YYYY-MM-DD
const DateString = z.templateLiteral([
  z.string().regex(/^\d{4}$/),  // Year
  "-",
  z.string().regex(/^(0[1-9]|1[0-2])$/),  // Month
  "-",
  z.string().regex(/^(0[1-9]|[12]\d|3[01])$/)  // Day
])

DateString.parse("2024-01-15") // ✓
DateString.parse("2024-1-15") // ✗ (month needs leading zero)
```

### Currency Format

```typescript
// ${amount}
const Price = z.templateLiteral([
  "$",
  z.string().regex(/^\d+(\.\d{2})?$/)
])

Price.parse("$99") // ✓
Price.parse("$99.99") // ✓
Price.parse("99.99") // ✗
```

### Email-like Patterns

```typescript
// {name}@example.com
const CompanyEmail = z.templateLiteral([
  z.string().min(1).max(64).regex(/^[a-z0-9._-]+$/),
  "@",
  z.string().regex(/^example\.com$/)
])
```

## Multiple Parts

```typescript
// Complex template with multiple interpolations
const ResourceId = z.templateLiteral([
  z.enum(["user", "org", "team"]),
  ":",
  z.string().uuid(),
  ":",
  z.enum(["settings", "profile", "billing"])
])

ResourceId.parse("user:123e4567-e89b-12d3-a456-426614174000:settings") // ✓
```

## Type Inference

```typescript
const Path = z.templateLiteral(["/users/", z.string()])

type Path = z.infer<typeof Path>
// `/users/${string}` - TypeScript template literal type
```

### Complex Inference

```typescript
const Version = z.templateLiteral([
  "v",
  z.number(),
  ".",
  z.number()
])

type Version = z.infer<typeof Version>
// `v${number}.${number}`
```

## Template Literal vs Regex

```typescript
// Template literal (type-safe)
const UserId1 = z.templateLiteral(["user_", z.string().uuid()])

// Regex (not type-safe for interpolation)
const UserId2 = z.string().regex(/^user_[0-9a-f-]{36}$/)

// Template literal provides better type inference
type T1 = z.infer<typeof UserId1> // `user_${string}`
type T2 = z.infer<typeof UserId2> // string
```

## Combining with Other Schemas

```typescript
const Resource = z.object({
  id: z.templateLiteral(["res_", z.string().ulid()]),
  type: z.enum(["file", "folder"]),
  name: z.string()
})
```

## Edge Cases

```typescript
// Empty parts array
z.templateLiteral([]) // Matches only ""

// Single string part (same as literal)
z.templateLiteral(["static"]) // Same as z.literal("static")

// Adjacent schemas (concatenated)
z.templateLiteral([z.string(), z.string()])
// Matches any string (two strings concatenated)
```

## Limitations

- Parts must be strings or string-producing schemas
- No repetition operators (use regex for complex patterns)
- Cannot validate semantic meaning (e.g., date validity)

## Tips

1. **Use for structured strings**: IDs, paths, formatted values
2. **Better type inference**: Template literals produce literal types
3. **Combine with constraints**: z.string().uuid() for typed interpolation
4. **Prefer regex for complex patterns**: Template literals work best for simple formats
5. **TypeScript 4.1+ required**: For template literal type inference
