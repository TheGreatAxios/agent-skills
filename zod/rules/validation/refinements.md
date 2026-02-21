# Rule: Refinements

## Why It Matters

Refinements add custom validation logic beyond built-in methods. Use for cross-field validation, complex business rules, and domain-specific constraints.

## .refine()

Basic custom validation.

```typescript
import { z } from "zod"

// Simple refinement
const PositiveEvenNumber = z.number()
  .refine(n => n > 0 && n % 2 === 0, {
    message: "Must be a positive even number"
  })

// With return type annotation
const Email = z.string()
  .refine((s): s is string => s.includes("@"), {
    message: "Invalid email"
  })
```

## Refine Options

```typescript
const schema = z.string().refine(
  (value) => value.length > 5,
  {
    message: "String must be longer than 5 characters",
    path: ["customPath"],  // Error path
    // v4: Additional options
  }
)
```

## .superRefine()

Add multiple issues or complex validation logic.

```typescript
const Password = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 8 characters"
    })
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain an uppercase letter"
    })
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain a number"
    })
  }
})

// Reports ALL issues, not just the first
```

## .check() (v4)

New validation API in v4 with cleaner syntax.

```typescript
const Password = z.string().check((ctx) => {
  if (ctx.value.length < 8) {
    ctx.issues.push({
      message: "Must be at least 8 characters"
    })
  }
  if (!/[A-Z]/.test(ctx.value)) {
    ctx.issues.push({
      message: "Must contain uppercase letter"
    })
  }
})
```

## Common Patterns

### Password Validation

```typescript
const Password = z.string()
  .min(8, "At least 8 characters")
  .superRefine((val, ctx) => {
    const checks = [
      { test: /[A-Z]/.test(val), message: "Uppercase letter required" },
      { test: /[a-z]/.test(val), message: "Lowercase letter required" },
      { test: /[0-9]/.test(val), message: "Number required" },
      { test: /[^A-Za-z0-9]/.test(val), message: "Special character required" }
    ]

    for (const { test, message } of checks) {
      if (!test) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message
        })
      }
    }
  })
```

### Password Confirmation

```typescript
const Registration = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
)
```

### Date Range

```typescript
const DateRange = z.object({
  start: z.date(),
  end: z.date()
}).refine(
  ({ start, end }) => start < end,
  {
    message: "End date must be after start date",
    path: ["end"]
  }
)
```

### Age Validation

```typescript
const AdultBirthDate = z.date().refine(
  (date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 18
  },
  { message: "Must be at least 18 years old" }
)
```

### Unique Array

```typescript
const UniqueArray = z.array(z.string()).refine(
  (arr) => new Set(arr).size === arr.length,
  { message: "Array must contain unique values" }
)
```

### Credit Card (Luhn)

```typescript
const CreditCard = z.string().refine(
  (num) => {
    const digits = num.replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19) return false

    let sum = 0
    let isEven = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10)
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  },
  { message: "Invalid credit card number" }
)
```

### Conditional Validation

```typescript
const Form = z.object({
  accountType: z.enum(["personal", "business"]),
  companyName: z.string().optional()
}).refine(
  (data) => {
    if (data.accountType === "business") {
      return !!data.companyName
    }
    return true
  },
  {
    message: "Company name required for business accounts",
    path: ["companyName"]
  }
)
```

## Async Refinement

```typescript
const Username = z.string().refine(
  async (username) => {
    const response = await fetch(`/api/check-username/${username}`)
    const { available } = await response.json()
    return available
  },
  { message: "Username already taken" }
)

// Use parseAsync
const result = await Username.parseAsync("myusername")
```

## Refinement Parameters (v4)

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | T | The value being validated |
| `ctx` | RefineCtx | Context for adding issues |
| `issue` | object | Issue configuration |

## Error Path

Specify where the error appears:

```typescript
z.object({
  address: z.object({
    zip: z.string()
  })
}).refine(
  (data) => data.address.zip.length === 5,
  {
    message: "ZIP must be 5 digits",
    path: ["address", "zip"]
  }
)
```

## Abort Early

Stop validation on first error:

```typescript
const Schema = z.string()
  .refine(s => s.length > 5, { message: "Too short" })
  .refine(s => s.includes("a"), { message: "Must contain 'a'" })

Schema.parse("hi", { abortEarly: true })
// Only reports "Too short", not both errors
```

## When Clause (v4)

Conditional refinement execution:

```typescript
const Schema = z.object({
  type: z.enum(["a", "b"]),
  value: z.number()
}).check((ctx) => {
  if (ctx.value.type === "a" && ctx.value.value < 10) {
    ctx.issues.push({
      message: "Value must be >= 10 for type 'a'"
    })
  }
})
```

## Type Narrowing

Use refinements to narrow types:

```typescript
const EvenNumber = z.number().refine(
  (n): n is number => n % 2 === 0,
  { message: "Must be even" }
)

// Type predicate doesn't change inferred type
// But can be used with type guards at runtime
```

## Tips

1. **Use superRefine for multiple errors**: Collects all issues
2. **Always set path**: Errors appear on correct field
3. **Use async for API checks**: Username availability, etc.
4. **Keep refinements pure**: Avoid side effects
5. **Combine with built-ins**: Use min/max before refine
