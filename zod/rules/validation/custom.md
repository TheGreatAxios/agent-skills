# Rule: Custom Validation

## Why It Matters

Custom validation handles cases not covered by built-in methods. Use for domain-specific rules, external validation libraries, and complex validation logic.

## z.custom()

Create custom validator from a function.

```typescript
import { z } from "zod"

// Basic custom validator
const CustomString = z.custom<string>((val) => {
  return typeof val === "string"
}, "Value must be a string")

CustomString.parse("hello") // ✓
CustomString.parse(123)     // ✗ throws
```

## With Type Parameter

```typescript
// Type parameter for type inference
const PositiveNumber = z.custom<number>((val) => {
  return typeof val === "number" && val > 0
}, "Must be a positive number")

type Positive = z.infer<typeof PositiveNumber> // number
```

## Custom Error Messages

```typescript
const Email = z.custom<string>(
  (val) => {
    if (typeof val !== "string") return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  },
  {
    message: "Invalid email format",
    // Additional error options
  }
)
```

### Message Function

```typescript
// v4: Dynamic error message
const Custom = z.custom(
  (val) => val !== null,
  (val) => `Expected non-null, got ${typeof val}`
)
```

## Common Patterns

### Class Instance

```typescript
class User {
  constructor(public id: string, public name: string) {}
}

const UserInstance = z.custom<User>((val) => {
  return val instanceof User
}, "Must be a User instance")

// Or use z.instanceof()
const UserInstanceAlt = z.instanceof(User)
```

### Buffer/Uint8Array

```typescript
const BufferSchema = z.custom<Buffer>((val) => {
  return Buffer.isBuffer(val)
}, "Must be a Buffer")

const Uint8ArraySchema = z.custom<Uint8Array>((val) => {
  return val instanceof Uint8Array
}, "Must be Uint8Array")
```

### Regex with Custom Message

```typescript
const Slug = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val)
}, "Must be a valid slug (lowercase letters, numbers, hyphens)")
```

### External Validator Integration

```typescript
import validator from "validator"

const MobilePhone = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  return validator.isMobilePhone(val)
}, "Invalid mobile phone number")

const CreditCard = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  return validator.isCreditCard(val)
}, "Invalid credit card number")
```

### Moment/Date-fns Integration

```typescript
import { isValid, parseISO } from "date-fns"

const ISODateString = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  return isValid(parseISO(val))
}, "Invalid ISO date string")
```

### MongoDB ObjectId

```typescript
import { ObjectId } from "mongodb"

const MongoId = z.custom<ObjectId>((val) => {
  return ObjectId.isValid(val)
}, "Invalid MongoDB ObjectId")

// Or as string
const MongoIdString = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  return ObjectId.isValid(val) && String(new ObjectId(val)) === val
}, "Invalid MongoDB ObjectId string")
```

### BigInt Range

```typescript
const SafeBigInt = z.custom<bigint>((val) => {
  if (typeof val !== "bigint") return false
  return val >= 0n && val <= BigInt(Number.MAX_SAFE_INTEGER)
}, "BigInt must be between 0 and MAX_SAFE_INTEGER")
```

## .apply() (v4)

Apply custom validation to existing schema.

```typescript
// v4 syntax
const CustomNumber = z.number()
  .apply((val) => val % 2 === 0, "Must be even")

// Equivalent to refine but with cleaner syntax
```

## Combining with Refine

```typescript
// Custom type check + additional validation
const CustomEmail = z.custom<string>((val) => {
  return typeof val === "string"
})
.refine(val => val.includes("@"), "Must contain @")
.refine(val => val.length < 255, "Too long")
```

## Custom with Transform

```typescript
// Validate and transform
const TrimmedEmail = z.custom<string>((val) => {
  if (typeof val !== "string") return false
  const trimmed = val.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}).transform(val => val.trim().toLowerCase())
```

## Error Path

```typescript
const Nested = z.object({
  value: z.custom((val) => val !== null, {
    message: "Value cannot be null",
    path: ["value"]
  })
})
```

## Type Guard Pattern

```typescript
// Use type guard function
function isUser(val: unknown): val is User {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val &&
    "name" in val &&
    typeof val.id === "string" &&
    typeof val.name === "string"
  )
}

const UserSchema = z.custom<User>(isUser, "Invalid User object")
```

## Async Custom Validation

```typescript
const UniqueUsername = z.custom<string>(async (val) => {
  if (typeof val !== "string") return false
  const response = await fetch(`/api/check-username/${val}`)
  const { available } = await response.json()
  return available
}, "Username already taken")

// Use parseAsync
const result = await UniqueUsername.parseAsync("myusername")
```

## Custom vs Refine

```typescript
// z.custom: Define entire validation from scratch
const Custom = z.custom<string>((val) => {
  return typeof val === "string" && val.length > 0
})

// z.string().refine: Start with string, add validation
const Refined = z.string().refine(val => val.length > 0)

// Use custom for:
// - Non-standard types
// - External library integration
// - Type checking without base schema

// Use refine for:
// - Adding validation to existing schema
// - When base type validation is useful
```

## Type Inference

```typescript
// Type parameter determines inference
const NumberSchema = z.custom<number>((val) => typeof val === "number")
type Num = z.infer<typeof NumberSchema> // number

// Without type parameter
const UnknownSchema = z.custom((val) => val !== null)
type Unk = z.infer<typeof UnknownSchema> // unknown
```

## Tips

1. **Use type parameter**: Ensures correct type inference
2. **Combine with refine**: Custom for type, refine for rules
3. **Return boolean**: Validation function should return true/false
4. **Consider instanceof**: For class instances, use z.instanceof()
5. **External libraries**: Great for validator.js, date-fns, etc.
