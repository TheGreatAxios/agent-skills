# Rule: validation-and-errors

## Why It Matters

ArkType provides flexible validation methods with clear error reporting. Understanding how to handle validation results and customize errors is essential for good UX.

## Validation Methods

### Type as Function

Returns validated data or `type.errors` instance:

```typescript
const User = type({ name: "string", age: "number.integer >= 0" })

const result = User({ name: "Alice", age: 30 })
if (result instanceof type.errors) {
  console.error(result.summary)
  // or: result.throw()
} else {
  console.log(result.name)  // TypeScript knows this is valid
}
```

### .validate()

Returns discriminated union:

```typescript
const result = User.validate({ name: "Bob", age: -5 })

if (result.errors) {
  console.error(result.errors)
} else {
  console.log(result.data)  // { name: "Bob", age: -5 }
}
```

### .assert()

Returns validated data or throws:

```typescript
try {
  const data = User.assert({ name: "Charlie" })
  console.log(data.name)
} catch (e) {
  if (e instanceof type.errors) {
    console.error(e.summary)
  }
}
```

## Error Handling

### Basic Error Check

```typescript
const out = MyType(input)

if (out instanceof type.errors) {
  // handle error
}
```

### Type Narrowing

```typescript
interface RuntimeErrors extends type.errors {
  /**age must be at least 0 (was -5)*/
  summary: string
}

const isRuntimeErrors = (e: type.errors): e is RuntimeErrors => true

const out = User(input)

if (out instanceof type.errors && isRuntimeErrors(out)) {
  console.log(out.summary)  // typed!
}
```

### Error Properties

```typescript
if (out instanceof type.errors) {
  out.summary      // Full error string
  out.message       // Single message
  out.code          // Error code (e.g., "minLength")
  out.path          // Path to error (array of keys/indices)
  out.expected      // Expected type description
  out.actual        // Actual value (sanitized)
}
```

## Custom Error Messages

### Description (Simplest)

```typescript
const Password = type("string >= 8").describe("a valid password")
// Error: "must be a valid password"
```

### Configure (Full Control)

```typescript
const Age = type("number.integer >= 0").configure({
  // Primary message
  description: "a non-negative integer",

  // Customize "expected" part
  expected: ctx => `>= 0`,

  // Customize "problem" part (combines expected + actual)
  problem: ctx => `${ctx.actual} is negative!`,

  // Customize full message with path
  message: ctx =>
    `${ctx.propString || "(root)"}: ${ctx.actual} isn't valid`,

  // Hide actual value (e.g., passwords)
  actual: () => ""
})

const User = type({
  age: Age
})

// Error: "age: -5 isn't valid"
const out = User({ age: -5 })
```

### Scope-level Configuration

```typescript
const myScope = scope(
  { User: { age: "number < 100" } },
  {
    max: {
      actual: () => "unacceptably large"
    }
  }
)

// Error: "age must be less than 100 (was unacceptably large)"
myScope.User({ age: 101 })
```

## Error Codes

| Code | Meaning |
|------|---------|
| `type` | Wrong base type |
| `minLength` / `maxLength` | Array/string length |
| `min` / `max` | Number bounds |
| `divisor` | Divisibility |
| `pattern` | Regex mismatch |
| `format` | Email/UUID/etc. |
| `required` | Missing required key |
| `undeclaredKey` | Extra key (with `onUndeclaredKey: "reject"`) |

## Global Error Configuration

### onFail Behavior

```typescript
import { configure } from "arktype/config"

configure({
  onFail: errors => errors.throw()  // always throw
})

declare global {
  interface ArkEnv {
    onFail: typeof config.onFail
  }
}
```

### undeclaredKey Behavior

```typescript
configure({
  // "ignore" (default) - allow extra keys
  // "reject" - error on extra keys
  // "delete" - strip extra keys
  onUndeclaredKey: "reject"
})
```

## Common Error Patterns

### Password Confirmation

```typescript
const Form = type({
  password: "string >= 8",
  confirmPassword: "string"
}).narrow((data, ctx) => {
  if (data.password === data.confirmPassword) return true
  return ctx.reject({
    expected: "identical to password",
    actual: "",  // don't leak password
    path: ["confirmPassword"]
  })
})
// Error: "confirmPassword must be identical to password"
```

### Custom Context in Errors

```typescript
const Product = type({
  price: "number > 0"
}).configure({
  problem: ctx => {
    if (ctx.code === "min") {
      return `price must be positive (got ${ctx.actual})`
    }
    return ctx.defaultProblem()
  }
})
```

## Testing Errors

### With Attest

```typescript
import { attest } from "@ark/attest"

// @ts-expect-error
attest(() => type("number%0")).throwsAndHasTypeError(
  "% operator must be followed by a non-zero integer literal (was 0)"
)
```

## Error Handling Tips

1. **Use `instanceof type.errors`** for runtime checks
2. **Provide descriptions** for user-facing messages
3. **Sanitize sensitive data** with `actual: () => ""`
4. **Customize per scope** for domain-specific errors
5. **Use `onUndeclaredKey: "reject"`** for strict validation
