# Rule: Preprocess

## Why It Matters

Preprocess transforms input before validation begins. Use for data cleanup, format detection, and handling varied input formats before schema validation.

## z.preprocess()

Transform input before any validation.

```typescript
import { z } from "zod"

// Always convert to number first
const AlwaysNumber = z.preprocess(
  (val) => Number(val),
  z.number()
)

AlwaysNumber.parse("123")   // 123 (number)
AlwaysNumber.parse(123)     // 123 (number)
AlwaysNumber.parse(true)    // 1 (number)
```

## Basic Usage

```typescript
// Convert null to undefined
const NullToUndefined = z.preprocess(
  (val) => val ?? undefined,
  z.string().optional()
)

// Trim string if it's a string
const Trimmed = z.preprocess(
  (val) => typeof val === "string" ? val.trim() : val,
  z.string()
)

// Parse JSON string
const JsonInput = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val)
      } catch {
        return val
      }
    }
    return val
  },
  z.object({ id: z.string() })
)
```

## Common Patterns

### Null/Empty Handling

```typescript
// Convert empty string to undefined
const OptionalString = z.preprocess(
  (val) => val === "" ? undefined : val,
  z.string().optional()
)

// Convert null to default value
const WithDefault = z.preprocess(
  (val) => val ?? "default",
  z.string()
)
```

### Date Parsing

```typescript
// Flexible date input
const FlexibleDate = z.preprocess(
  (val) => {
    if (val instanceof Date) return val
    if (typeof val === "string") return new Date(val)
    if (typeof val === "number") return new Date(val)
    return val
  },
  z.date()
)

FlexibleDate.parse("2024-01-15") // Date
FlexibleDate.parse(1705312200000) // Date
FlexibleDate.parse(new Date()) // Date
```

### Number Coercion

```typescript
// Parse number from string (more aggressive than coerce)
const ParseNumber = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? val : parsed
    }
    return val
  },
  z.number()
)
```

### Array Coercion

```typescript
// Ensure value is array
const EnsureArray = z.preprocess(
  (val) => Array.isArray(val) ? val : [val],
  z.array(z.string())
)

EnsureArray.parse("single") // ["single"]
EnsureArray.parse(["a", "b"]) // ["a", "b"]
```

### Object Cleanup

```typescript
// Remove null values from object
const CleanObject = z.preprocess(
  (val) => {
    if (val && typeof val === "object") {
      return Object.fromEntries(
        Object.entries(val).filter(([_, v]) => v !== null)
      )
    }
    return val
  },
  z.record(z.unknown())
)
```

### Form Data Normalization

```typescript
// Handle form data quirks
const FormDataString = z.preprocess(
  (val) => {
    if (val === null || val === undefined) return ""
    if (Array.isArray(val)) return val.join(",")
    return String(val)
  },
  z.string()
)
```

### Case Insensitive Input

```typescript
const LowercaseInput = z.preprocess(
  (val) => typeof val === "string" ? val.toLowerCase() : val,
  z.enum(["active", "inactive", "pending"])
)

LowercaseInput.parse("ACTIVE") // "active"
LowercaseInput.parse("Active") // "active"
```

### Query String Parsing

```typescript
// Parse comma-separated values
const Tags = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return val.split(",").map(s => s.trim())
    }
    return val
  },
  z.array(z.string())
)

Tags.parse("tag1, tag2, tag3") // ["tag1", "tag2", "tag3"]
```

## Preprocess vs Transform

```typescript
// Preprocess: Runs BEFORE validation
const Pre = z.preprocess(
  (val) => String(val).trim(),
  z.string().min(1)  // Validates AFTER preprocess
)

// Transform: Runs AFTER validation
const Post = z.string()
  .min(1)  // Validates FIRST
  .transform(s => s.trim())

// Key difference:
Pre.parse(123)   // ✓ Preprocess converts to "123", then validates
Post.parse(123)  // ✗ Fails validation (123 is not string)
```

## Preprocess vs Coerce

```typescript
// Coerce: Built-in type coercion
const Coerced = z.coerce.number()
Coerced.parse("123") // 123

// Preprocess: Custom logic
const CustomCoerced = z.preprocess(
  (val) => {
    if (val === "N/A") return 0
    return Number(val)
  },
  z.number()
)

CustomCoerced.parse("N/A") // 0
CustomCoerced.parse("123") // 123
```

## Accessing Raw Input

```typescript
// Preprocess receives raw input before any processing
const Schema = z.preprocess(
  (val) => {
    console.log("Raw input:", val, typeof val)
    return val
  },
  z.string()
)
```

## Combining with Other Methods

```typescript
// Preprocess + Validation + Transform
const Email = z.preprocess(
  (val) => typeof val === "string" ? val.trim().toLowerCase() : val,
  z.string().email()
).transform(e => e)

// Preprocess for optional objects
const OptionalObject = z.preprocess(
  (val) => val ?? {},
  z.object({
    name: z.string().optional()
  })
)
```

## Type Inference

```typescript
const Schema = z.preprocess(
  (val) => Number(val),
  z.number()
)

// Input type is unknown (preprocess accepts anything)
type Input = z.input<typeof Schema> // unknown

// Output is the schema's output
type Output = z.infer<typeof Schema> // number
```

## Error Handling

```typescript
const SafePreprocess = z.preprocess(
  (val) => {
    try {
      return JSON.parse(String(val))
    } catch {
      return val // Return original if parse fails
    }
  },
  z.object({ id: z.string() })
)

// If preprocess returns invalid value, schema validation fails
```

## Tips

1. **Use for input normalization**: Handle varied input formats
2. **Falls through to validation**: Return val if not handling
3. **Consider coerce first**: Use built-in coercion when possible
4. **Keep it simple**: Complex logic can be hard to debug
5. **Type is unknown**: Input type before preprocess is unknown
