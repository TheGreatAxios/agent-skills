# Rule: Error Formatting

## Why It Matters

Zod errors can be complex with nested paths and multiple issues. Formatting functions transform these into structures suitable for display, APIs, and logging.

## Error Structure

```typescript
import { z } from "zod"

const User = z.object({
  name: z.string(),
  address: z.object({
    city: z.string(),
    zip: z.string()
  })
})

try {
  User.parse({ name: 123, address: { city: "NYC", zip: 123 } })
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors)
    // Array of ZodIssue objects
  }
}
```

## ZodIssue Structure

```typescript
interface ZodIssue {
  code: ZodIssueCode      // Type of error
  message: string          // Human-readable message
  path: (string | number)[] // Path to the error
  expected?: string        // Expected type/value
  received?: string        // Received type/value
  // ... code-specific fields
}
```

## z.prettifyError()

Human-readable error string.

```typescript
import { z } from "zod"

const result = schema.safeParse(data)

if (!result.success) {
  const pretty = z.prettifyError(result.error)
  console.log(pretty)
  // [
  //   "name: Expected string, received number",
  //   "address.zip: Expected string, received number"
  // ]
}
```

## z.treeifyError()

Tree structure of errors.

```typescript
const tree = z.treeifyError(result.error)
// {
//   name: { _errors: ["Expected string, received number"] },
//   address: {
//     _errors: [],
//     zip: { _errors: ["Expected string, received number"] }
//   }
// }
```

## z.formatError()

Formatted object with all errors.

```typescript
const formatted = z.formatError(result.error)
// {
//   name: { _errors: ["Expected string, received number"] },
//   address: {
//     _errors: [],
//     properties: {
//       zip: { _errors: ["Expected string, received number"] }
//     }
//   }
// }
```

## z.flattenError()

Flattened error structure.

```typescript
const flat = z.flattenError(result.error)
// {
//   formErrors: ["Some object-level error"],
//   fieldErrors: {
//     name: ["Expected string, received number"],
//     "address.zip": ["Expected string, received number"]
//   }
// }
```

## Common Patterns

### API Error Response

```typescript
app.post("/users", (req, res) => {
  const result = CreateUserSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: z.flattenError(result.error).fieldErrors
    })
  }

  // ...
})

// Response:
// {
//   "error": "Validation failed",
//   "details": {
//     "email": ["Invalid email format"],
//     "password": ["Must be at least 8 characters"]
//   }
// }
```

### Form Error Display

```typescript
function getFormErrors<T>(result: z.SafeParseReturnType<T, T>) {
  if (result.success) return {}

  const errors: Record<string, string> = {}
  for (const issue of result.error.errors) {
    const path = issue.path.join(".")
    errors[path] = issue.message
  }
  return errors
}

// Usage
const result = FormSchema.safeParse(formData)
const errors = getFormErrors(result)
// { "email": "Invalid email", "password": "Too short" }
```

### Grouped Errors

```typescript
function groupErrorsByPath(error: z.ZodError) {
  const groups: Record<string, string[]> = {}

  for (const issue of error.errors) {
    const path = issue.path.join(".") || "_form"
    if (!groups[path]) groups[path] = []
    groups[path].push(issue.message)
  }

  return groups
}

// { "email": ["Invalid format", "Already taken"] }
```

### Nested Path Formatting

```typescript
function formatNestedPath(path: (string | number)[]): string {
  return path.reduce<string>((acc, key, i) => {
    if (typeof key === "number") {
      return `${acc}[${key}]`
    }
    return i === 0 ? key : `${acc}.${key}`
  }, "")
}

// ["users", 0, "email"] => "users[0].email"
```

### Error Summary

```typescript
function getErrorSummary(error: z.ZodError): string {
  const count = error.errors.length
  if (count === 1) {
    const [issue] = error.errors
    return `${formatNestedPath(issue.path)}: ${issue.message}`
  }
  return `${count} validation errors`
}
```

### Log-Friendly Format

```typescript
function formatForLogging(error: z.ZodError): object {
  return {
    errors: error.errors.map(issue => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code
    }))
  }
}

// {
//   "errors": [
//     { "path": "email", "message": "Invalid email", "code": "invalid_string" }
//   ]
// }
```

## Accessing Raw Errors

```typescript
const result = schema.safeParse(data)

if (!result.success) {
  // Direct access to issues array
  result.error.errors.forEach(issue => {
    console.log({
      path: issue.path,
      message: issue.message,
      code: issue.code
    })
  })

  // Error properties
  console.log(result.error.issues) // Same as .errors
  console.log(result.error.message) // Combined message
}
```

## Custom Formatter

```typescript
function customFormatError(
  error: z.ZodError,
  messages: Record<string, string>
): Record<string, string> {
  const formatted: Record<string, string> = {}

  for (const issue of error.errors) {
    const path = issue.path.join(".")

    // Use custom message if provided
    const key = `${path}.${issue.code}`
    formatted[path] = messages[key] || issue.message
  }

  return formatted
}
```

## Error Codes

Common issue codes for conditional formatting:

| Code | Description |
|------|-------------|
| `invalid_type` | Wrong type |
| `invalid_string` | String format invalid |
| `too_small` | Below minimum |
| `too_big` | Above maximum |
| `invalid_enum_value` | Not in enum |
| `invalid_literal` | Not exact value |
| `custom` | Custom refinement |

## Tips

1. **Use flattenError for forms**: Easy field-to-error mapping
2. **Use prettifyError for logs**: Human-readable output
3. **Custom formatters**: Match your API/error format
4. **Group by path**: For multiple errors per field
5. **Include path info**: Essential for nested objects
