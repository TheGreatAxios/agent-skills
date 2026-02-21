# Rule: Parsing Methods

## Why It Matters

Parsing methods are the primary interface for validating data with Zod. Understanding the differences between sync/async and safe/throw variants is essential for proper error handling.

## .parse()

Synchronous parsing. Throws on validation error.

```typescript
import { z } from "zod"

const User = z.object({
  id: z.string(),
  name: z.string()
})

try {
  const user = User.parse({ id: "1", name: "John" })
  console.log(user) // { id: "1", name: "John" }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors)
  }
}
```

## .parseAsync()

Asynchronous parsing. Required for async refinements/transforms.

```typescript
const AsyncUser = z.object({
  email: z.string().email()
}).refine(
  async (data) => {
    const exists = await checkEmailExists(data.email)
    return !exists
  },
  { message: "Email already taken" }
)

// Must use parseAsync
const user = await AsyncUser.parseAsync({ email: "test@example.com" })
```

## .safeParse()

Returns result object instead of throwing.

```typescript
const result = User.safeParse({ id: "1", name: "John" })

if (result.success) {
  console.log(result.data) // { id: "1", name: "John" }
} else {
  console.error(result.error) // ZodError
  console.error(result.error.errors) // Array of issues
}
```

## .safeParseAsync()

Async version of safeParse.

```typescript
const result = await AsyncUser.safeParseAsync({ email: "test@example.com" })

if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

## .spa

Shorthand for safeParseAsync.

```typescript
// These are equivalent:
const result1 = await User.safeParseAsync(data)
const result2 = await User.spa(data)
```

## Comparison Table

| Method | Returns | Throws | Async |
|--------|---------|--------|-------|
| `.parse()` | T | Yes | No |
| `.parseAsync()` | Promise\<T\> | Yes | Yes |
| `.safeParse()` | SafeReturnType | No | No |
| `.safeParseAsync()` | Promise\<SafeReturnType\> | No | Yes |
| `.spa` | Promise\<SafeReturnType\> | No | Yes |

## SafeReturnType

```typescript
type SafeReturnType<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError }
```

## Parse Options

```typescript
// Additional parsing options
const result = schema.parse(data, {
  path: ["custom", "path"],  // Custom error path
  async: false,              // Force async mode
  // v4: Additional options
})
```

## Common Patterns

### API Input Validation

```typescript
app.post("/users", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.errors
    })
  }

  const user = await createUser(result.data)
  res.json(user)
})
```

### Try-Catch Pattern

```typescript
function parseUser(data: unknown) {
  try {
    return { success: true as const, data: User.parse(data) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error }
    }
    throw error // Re-throw non-Zod errors
  }
}
```

### Async with Error Handling

```typescript
async function validateAsync(data: unknown) {
  try {
    const result = await AsyncSchema.parseAsync(data)
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      throw new ValidationError(error.errors)
    }
    throw error
  }
}
```

### Batch Validation

```typescript
async function validateBatch(items: unknown[]) {
  const results = await Promise.all(
    items.map(item => ItemSchema.spa(item))
  )

  const valid = results
    .filter((r): r is { success: true; data: Item } => r.success)
    .map(r => r.data)

  const invalid = results
    .filter((r): r is { success: false; error: ZodError } => !r.success)
    .map(r => r.error)

  return { valid, invalid }
}
```

### Form Validation

```typescript
function validateForm<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const data = Object.fromEntries(formData)
  return schema.safeParse(data)
}
```

### Query Params

```typescript
function parseQuery<T extends z.ZodTypeAny>(
  schema: T,
  params: URLSearchParams
): z.infer<T> {
  const obj: Record<string, string> = {}
  params.forEach((value, key) => {
    obj[key] = value
  })
  return schema.parse(obj)
}
```

## When to Use Each Method

| Scenario | Method |
|----------|--------|
| Simple validation | `.parse()` |
| Need error handling | `.safeParse()` |
| Async refinements | `.parseAsync()` |
| Async + error handling | `.spa` or `.safeParseAsync()` |
| Performance critical | `.parse()` (no object allocation) |

## Error Access

```typescript
const result = schema.safeParse(data)

if (!result.success) {
  // ZodError methods
  result.error.errors     // Array of ZodIssue
  result.error.issues     // Same as errors
  result.error.message    // Combined message
  result.error.format()   // Formatted errors
  result.error.flatten()  // Flattened structure
}
```

## Type Narrowing

```typescript
const result = schema.safeParse(data)

if (result.success) {
  // TypeScript narrows to success case
  const user: User = result.data
} else {
  // TypeScript knows this is error case
  const error: ZodError = result.error
}
```

## Tips

1. **Use safeParse for APIs**: Better error handling pattern
2. **Use parseAsync for async**: Required when schema has async
3. **spa is convenient**: Shorthand for safeParseAsync
4. **Type narrowing**: TypeScript handles success/error types
5. **Batch with Promise.all**: For validating arrays efficiently
