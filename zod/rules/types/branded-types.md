# Rule: Branded Types

## Why It Matters

Branded types create nominal types from structural types, preventing accidental mixing of types that share the same underlying representation. Use for IDs, validated strings, and domain-specific types.

## .brand()

Create a branded type with a unique identifier.

```typescript
import { z } from "zod"

// Branded User ID type
const UserId = z.string().uuid().brand<"UserId">()

type UserId = z.infer<typeof UserId>
// string & { [z.BRAND]: { UserId: true } }

// Branded Email type
const Email = z.string().email().brand<"Email">()

type Email = z.infer<typeof Email>
// string & { [z.BRAND]: { Email: true } }
```

## Type Safety

```typescript
const UserId = z.string().uuid().brand<"UserId">()
const OrderId = z.string().uuid().brand<"OrderId">()

type UserId = z.infer<typeof UserId>
type OrderId = z.infer<typeof OrderId>

function getUser(id: UserId) {
  // Only accepts UserId branded type
}

const userId = UserId.parse("123e4567-e89b-12d3-a456-426614174000")
const orderId = OrderId.parse("123e4567-e89b-12d3-a456-426614174000")

getUser(userId)   // ✓ Correct brand
getUser(orderId)  // ✗ TypeScript error - wrong brand
getUser("123e4567-e89b-12d3-a456-426614174000") // ✗ Error - not branded
```

## Common Patterns

### Entity IDs

```typescript
// Different ID types
const UserId = z.string().uuid().brand<"UserId">()
const PostId = z.string().uuid().brand<"PostId">()
const CommentId = z.string().uuid().brand<"CommentId">()

// Prevents mixing IDs
function getPost(id: PostId) { /* ... */ }
function getComment(id: CommentId) { /* ... */ }
```

### Validated Strings

```typescript
// Email that's been validated
const ValidatedEmail = z.string().email().brand<"ValidatedEmail">()

// Password that meets requirements
const StrongPassword = z.string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .brand<"StrongPassword">()

// Use only after validation
function sendEmail(email: ValidatedEmail) {
  // Guaranteed to be valid email
}
```

### Currency Types

```typescript
const USD = z.number().positive().brand<"USD">()
const EUR = z.number().positive().brand<"EUR">()

function convert(usd: USD): EUR {
  // TypeScript enforces correct types
  return EUR.parse(usd * 0.85)
}
```

### URL Types

```typescript
const HttpsUrl = z.string().url()
  .startsWith("https://")
  .brand<"HttpsUrl">()

const ApiEndpoint = z.string().url()
  .startsWith("https://api.")
  .brand<"ApiEndpoint">()
```

### Temperature Types

```typescript
const Celsius = z.number().brand<"Celsius">()
const Fahrenheit = z.number().brand<"Fahrenheit">()

function toFahrenheit(c: Celsius): Fahrenheit {
  return Fahrenheit.parse(c * 9/5 + 32)
}

// Prevents mixing units
const temp = Celsius.parse(100)
const result = toFahrenheit(temp) // Correct
// toFahrenheit(Fahrenheit.parse(100)) // Error
```

## Extracting the Brand

```typescript
// The brand is a type-only construct
const UserId = z.string().uuid().brand<"UserId">()

// At runtime, it's just a string
const id = UserId.parse("123e4567-e89b-12d3-a456-426614174000")
console.log(typeof id) // "string"

// Brand doesn't exist at runtime
console.log(id) // "123e4567-e89b-12d3-a456-426614174000"
```

## Unwrapping

```typescript
const BrandedString = z.string().brand<"MyBrand">()

// Get the inner schema (without brand)
const InnerString = BrandedString.unwrap()
// z.string()
```

## Branded Object Properties

```typescript
const User = z.object({
  id: z.string().uuid().brand<"UserId">(),
  email: z.string().email().brand<"Email">(),
  name: z.string()
})

type User = z.infer<typeof User>
// {
//   id: string & { [z.BRAND]: { UserId: true } }
//   email: string & { [z.BRAND]: { Email: true } }
//   name: string
// }
```

## Brand vs Type

```typescript
// Without brand: structural typing
type StringId = string
type StringName = string

const id: StringId = "123"
const name: StringName = id // ✓ Allowed - same structure

// With brand: nominal typing
const Id = z.string().brand<"Id">()
const Name = z.string().brand<"Name">()

const brandedId = Id.parse("123")
const brandedName: z.infer<typeof Name> = brandedId // ✗ Error
```

## Reconstructing Branded Types

```typescript
// Define brand type separately
type UserIdBrand = { UserId: true }
type UserId = string & { [z.BRAND]: UserIdBrand }

// Use in function signatures
function getUser(id: UserId): User {
  // ...
}
```

## Combining Brands

```typescript
// Multiple validations + brand
const SecureUrl = z.string()
  .url()
  .startsWith("https://")
  .max(2048)
  .brand<"SecureUrl">()

// Type inference
type SecureUrl = z.infer<typeof SecureUrl>
// string & { [z.BRAND]: { SecureUrl: true } }
```

## Safe Parse with Branded Types

```typescript
const UserId = z.string().uuid().brand<"UserId">()

const result = UserId.safeParse("invalid")
if (result.success) {
  // result.data is branded UserId
  console.log(result.data)
}
```

## Brand Symbol

```typescript
// Zod uses a symbol for the brand key
import { z } from "zod"

// The brand key is: z.BRAND
// Type: unique symbol
```

## Tips

1. **Use for IDs**: Prevent mixing different entity IDs
2. **Use for validated data**: Mark data that's passed validation
3. **Use for units**: Distinguish between different unit types
4. **Zero runtime cost**: Brand is type-only, no runtime overhead
5. **Combine with validation**: Brand after validation rules
