# Rule: Error Customization

## Why It Matters

Custom error messages improve user experience and debugging. Zod provides multiple levels of error customization from schema-level to global settings.

## Schema-Level Errors

### Type Errors

```typescript
import { z } from "zod"

const User = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }),
  age: z.number({
    required_error: "Age is required",
    invalid_type_error: "Age must be a number"
  })
})
```

### Constraint Errors

```typescript
const Password = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
```

### Custom Messages with Object Syntax

```typescript
const Username = z.string()
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be at most 20 characters" })
```

## Error Map

### Global Error Map

```typescript
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === "string") {
        return { message: "Expected a string" }
      }
      break
    case z.ZodIssueCode.too_small:
      return { message: `Value is too small` }
  }
  return { message: ctx.defaultError }
})
```

### Schema-Specific Error Map

```typescript
const CustomSchema = z.string().errorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_string) {
    return { message: "Invalid string format" }
  }
  return { message: ctx.defaultError }
})
```

### Per-Parse Error Map

```typescript
const result = schema.safeParse(data, {
  errorMap: (issue, ctx) => {
    return { message: `Custom: ${ctx.defaultError}` }
  }
})
```

## Error Precedence

Errors are resolved in this order (highest to lowest priority):

1. Per-parse `errorMap` option
2. Schema `.errorMap()` method
3. Inline error messages (e.g., `.min(5, "message")`)
4. Global error map (`z.setErrorMap`)
5. Default English messages

## Custom Error Function (v4)

```typescript
// v4: Message can be a function
const DynamicMessage = z.string()
  .min(5, (ctx) => `Expected at least 5 characters, got ${ctx.value.length}`)

const NumberMessage = z.number()
  .positive((ctx) => `Value ${ctx.value} must be positive`)
```

## Common Patterns

### Form Validation Errors

```typescript
const ContactForm = z.object({
  name: z.string()
    .min(1, "Please enter your name"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .regex(/^\+?[\d\s-]+$/, "Please enter a valid phone number")
    .min(10, "Phone number is too short"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long")
})
```

### Conditional Error Messages

```typescript
const User = z.object({
  role: z.enum(["admin", "user"]),
  permissions: z.array(z.string())
}).refine(
  (data) => {
    if (data.role === "admin") return true
    return data.permissions.length > 0
  },
  {
    message: "Users must have at least one permission",
    path: ["permissions"]
  }
)
```

### Password Validation

```typescript
const Password = z.string()
  .min(8, { message: "At least 8 characters required" })
  .max(128, { message: "Password too long" })
  .superRefine((val, ctx) => {
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must include an uppercase letter"
      })
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must include a lowercase letter"
      })
    }
    if (!/[0-9]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must include a number"
      })
    }
  })
```

### Error with Context

```typescript
const Range = z.number()
  .min(0, (ctx) => `Value ${ctx.value} is below minimum of 0`)
  .max(100, (ctx) => `Value ${ctx.value} exceeds maximum of 100`)
```

## Error Types

```typescript
// ZodIssue types
interface ZodIssue {
  code: ZodIssueCode
  message: string
  path: (string | number)[]
  expected?: string
  received?: string
  // ... additional fields based on issue type
}

// Common issue codes
enum ZodIssueCode {
  invalid_type,
  invalid_literal,
  custom,
  invalid_union,
  invalid_union_discriminator,
  invalid_enum_value,
  unrecognized_keys,
  invalid_arguments,
  invalid_return_type,
  invalid_date,
  invalid_string,
  too_small,
  too_big,
  invalid_intersection_types,
  not_multiple_of,
  not_finite
}
```

## Custom Issue Creation

```typescript
const Schema = z.string().superRefine((val, ctx) => {
  if (val.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "String cannot be empty",
      path: [],
      // Additional metadata
      params: {
        customField: "some value"
      }
    })
  }
})
```

## Async Error Handling

```typescript
const AsyncSchema = z.string().refine(
  async (val) => {
    const exists = await checkValue(val)
    return !exists
  },
  { message: "Value already exists" }
)

try {
  await AsyncSchema.parseAsync("test")
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors)
  }
}
```

## Tips

1. **Provide specific messages**: Help users fix errors
2. **Use path for field errors**: Set correct error location
3. **Message functions (v4)**: Dynamic messages based on context
4. **Error precedence**: Know which message takes priority
5. **Test error output**: Ensure messages are user-friendly
