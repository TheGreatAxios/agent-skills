# Rule: Boolean Validation

## Why It Matters

Boolean validation ensures true/false values are correctly typed. Zod also provides `z.stringbool()` for parsing truthy/falsy string values, useful for environment variables and form inputs.

## z.boolean()

```typescript
import { z } from "zod"

// Basic boolean
const Active = z.boolean()

// With type inference
type Active = z.infer<typeof Active> // boolean
```

**Valid Values**
```typescript
z.boolean().parse(true) // ✓
z.boolean().parse(false) // ✓
z.boolean().parse(1) // ✗ throws
z.boolean().parse("true") // ✗ throws
z.boolean().parse(null) // ✗ throws
```

## Custom Error Messages

```typescript
const Active = z.boolean({
  required_error: "Active status is required",
  invalid_type_error: "Active must be true or false"
})
```

## z.stringbool()

Parses string values to boolean. Useful for environment variables and form data.

```typescript
// Basic stringbool
const StringBool = z.stringbool()

z.stringbool().parse("true") // true
z.stringbool().parse("false") // false
z.stringbool().parse("TRUE") // true
z.stringbool().parse("1") // true
z.stringbool().parse("0") // false
```

### Stringbool Options (v4)

```typescript
// Custom truthy/falsy values
const CustomStringBool = z.stringbool({
  truthy: ["yes", "y", "1", "true", "on"],
  falsy: ["no", "n", "0", "false", "off"]
})

// With custom error message
const StringBoolWithMessage = z.stringbool({
  message: "Must be 'true' or 'false'"
})
```

### Default Truthy/Falsy Values

| Truthy | Falsy |
|--------|-------|
| `"true"` | `"false"` |
| `"TRUE"` | `"FALSE"` |
| `"1"` | `"0"` |
| `"yes"` | `"no"` |
| `"on"` | `"off"` |

## Common Patterns

### Feature Flags

```typescript
const FeatureFlags = z.object({
  enableFeatureA: z.boolean().default(false),
  enableFeatureB: z.boolean().default(true),
  debugMode: z.boolean().default(false)
})
```

### Environment Variables

```typescript
const Env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DEBUG: z.stringbool().default("false"),
  ENABLE_CACHE: z.stringbool().default("true"),
  SSL_ENABLED: z.stringbool().optional()
})

// Usage
const env = Env.parse({
  NODE_ENV: "production",
  DEBUG: "false",
  ENABLE_CACHE: "true"
})
// env.DEBUG === false
// env.ENABLE_CACHE === true
```

### Form Inputs

```typescript
// Checkbox value
const CheckboxSchema = z.object({
  agreeToTerms: z.boolean().refine(v => v === true, {
    message: "You must agree to the terms"
  }),
  subscribeToNewsletter: z.boolean().default(false)
})
```

### API Response

```typescript
const ApiResponse = z.object({
  success: z.boolean(),
  isComplete: z.boolean(),
  hasErrors: z.boolean()
})
```

## Transform Patterns

### Boolean to String

```typescript
const BoolToString = z.boolean()
  .transform(v => v ? "yes" : "no")

z.boolean().transform(v => v.toString()).parse(true) // "true"
```

### Number to Boolean

```typescript
// Use coercion for number input
const NumberToBool = z.coerce.boolean()

z.coerce.boolean().parse(1) // true
z.coerce.boolean().parse(0) // false
z.coerce.boolean().parse(123) // true
```

### String to Boolean (without stringbool)

```typescript
const StringToBoolean = z.string()
  .transform(s => s.toLowerCase() === "true")
```

## Edge Cases

```typescript
// Boolean only accepts true/false
z.boolean().parse(true) // ✓
z.boolean().parse(false) // ✓
z.boolean().parse(Boolean(1)) // ✓ (converted to true)
z.boolean().parse(Boolean(0)) // ✓ (converted to false)
z.boolean().parse(!!1) // ✓ (converted to true)

// These fail:
z.boolean().parse(1) // ✗
z.boolean().parse("true") // ✗
z.boolean().parse(null) // ✗
z.boolean().parse(undefined) // ✗

// Coercion handles truthy/falsy
z.coerce.boolean().parse(1) // ✓ true
z.coerce.boolean().parse(0) // ✓ false
z.coerce.boolean().parse("") // ✓ false
z.coerce.boolean().parse("hello") // ✓ true
```

## Type Inference

```typescript
const schema = z.boolean()
type Inferred = z.infer<typeof schema> // boolean

const optional = z.boolean().optional()
type Optional = z.infer<typeof optional> // boolean | undefined

const stringbool = z.stringbool()
type StringBool = z.infer<typeof stringbool> // boolean
```

## Tips

1. **Use `z.stringbool()` for env vars**: Handles "true"/"false" strings
2. **Use `z.coerce.boolean()` for forms**: Handles 1/0 and truthy/falsy
3. **Refine for required true**: `z.boolean().refine(v => v)` for "must accept"
4. **Default values**: Use `.default()` for optional checkboxes
5. **Custom truthy values**: Use stringbool options for "yes"/"no" inputs
