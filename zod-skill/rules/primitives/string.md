# Rule: String Validation

## Why It Matters

Strings are the most common data type in validation. Zod provides comprehensive methods for length constraints, pattern matching, and transformations. Proper string validation prevents injection attacks and data integrity issues.

## Basic Usage

```typescript
import { z } from "zod"

// Basic string
const Name = z.string()

// With type inference
type Name = z.infer<typeof Name> // string
```

## Length Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum length | `z.string().min(1)` |
| `.max(n)` | Maximum length | `z.string().max(100)` |
| `.length(n)` | Exact length | `z.string().length(10)` |
| `.nonempty()` | At least 1 char | `z.string().nonempty()` |

```typescript
const Username = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")

const Code = z.string().length(6, "Code must be exactly 6 characters")

const RequiredField = z.string().nonempty("This field is required")
```

## Pattern Matching

| Method | Purpose | Example |
|--------|---------|---------|
| `.regex(re)` | Match pattern | `z.string().regex(/^[a-z]+$/)` |
| `.regex(re, msg)` | With custom message | `z.string().regex(/^\d+$/, "Numbers only")` |
| `.includes(s)` | Contains substring | `z.string().includes("@")` |
| `.startsWith(s)` | Starts with | `z.string().startsWith("https://")` |
| `.endsWith(s)` | Ends with | `z.string().endsWith(".com")` |

```typescript
// Alphanumeric only
const Alphanumeric = z.string().regex(/^[a-zA-Z0-9]+$/)

// Phone number pattern
const Phone = z.string().regex(/^\+?[\d\s-]{10,}$/)

// URL prefix requirement
const WebUrl = z.string()
  .startsWith("https://", "Must be HTTPS")
  .endsWith("/", "Must end with slash")

// Contains check
const EmailLocal = z.string().includes("@", { message: "Invalid email" })
```

## Transformations

| Method | Purpose | Example |
|--------|---------|---------|
| `.trim()` | Remove whitespace | `z.string().trim()` |
| `.toLowerCase()` | Convert to lowercase | `z.string().toLowerCase()` |
| `.toUpperCase()` | Convert to uppercase | `z.string().toUpperCase()` |
| `.normalize(form)` | Unicode normalize | `z.string().normalize("NFC")` |

```typescript
// Clean input
const CleanInput = z.string()
  .trim()
  .toLowerCase()

// Email normalization
const Email = z.string()
  .trim()
  .toLowerCase()
  .email()

// Unicode normalization
const UnicodeText = z.string()
  .normalize("NFC")
```

**Normalize Forms**
| Form | Description |
|------|-------------|
| `"NFC"` | Canonical Composition (default) |
| `"NFD"` | Canonical Decomposition |
| `"NFKC"` | Compatibility Composition |
| `"NFKD"` | Compatibility Decomposition |

## Combining Constraints

```typescript
// Password with multiple rules
const Password = z.string()
  .min(8, "Must be at least 8 characters")
  .max(100, "Too long")
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character")

// Username constraints
const Username = z.string()
  .trim()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores")

// API key format
const ApiKey = z.string()
  .startsWith("sk_")
  .length(32)
```

## Custom Error Messages

```typescript
const Name = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string"
})

// Per-constraint messages
const Code = z.string()
  .length(6, { message: "Code must be 6 characters" })

// Message function (v4)
const DynamicMessage = z.string()
  .min(5, (ctx) => `Expected at least 5, got ${ctx.value.length}`)
```

## Edge Cases

```typescript
// Empty string is valid by default
z.string().parse("") // ✓ passes

// Use .min(1) or .nonempty() to reject empty
z.string().min(1).parse("") // ✗ fails

// Whitespace strings are valid
z.string().parse("   ") // ✓ passes

// Use .trim() before .min() to reject whitespace-only
z.string().trim().min(1).parse("   ") // ✗ fails
```

## Type Inference

```typescript
const schema = z.string()
type Inferred = z.infer<typeof schema> // string

const optional = z.string().optional()
type Optional = z.infer<typeof optional> // string | undefined

const nullable = z.string().nullable()
type Nullable = z.infer<typeof nullable> // string | null
```

## Tips

1. **Chain order matters**: Apply `.trim()` before length checks
2. **Regex escaping**: Escape special characters in patterns
3. **Nonempty vs min(1)**: `.nonempty()` is semantically clearer
4. **Performance**: Simple constraints are faster than complex regex
5. **User experience**: Provide specific error messages
