# Rule: Object Methods

## Why It Matters

Object methods enable schema composition and derivation. Instead of duplicating schemas, use pick, omit, partial, extend, and merge to create variants from base schemas.

## .pick()

Select specific properties from object schema.

```typescript
import { z } from "zod"

const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

// Pick only public fields
const PublicUser = User.pick({ id: true, name: true, email: true })
// { id: string, name: string, email: string }

// Pick single field
const UserIdOnly = User.pick({ id: true })
// { id: string }
```

## .omit()

Remove specific properties from object schema.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date()
})

// Omit sensitive fields
const SafeUser = User.omit({ password: true })
// { id, name, email, createdAt }

// Omit multiple fields
const UserSummary = User.omit({ password: true, createdAt: true })
// { id, name, email }
```

## .partial()

Make all properties optional.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
})

// All fields optional
const PartialUser = User.partial()
// { id?: string, name?: string, email?: string }

// Validate update payloads
const updateUser = PartialUser.parse({ name: "New Name" })
// ✓ Valid - only updating name
```

### Partial Specific Keys

```typescript
// In v4, partial can accept specific keys
const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"])
})

// Make only some keys optional
const PartialName = User.partial({ name: true })
// { id: string, name?: string, email: string, role: string }
```

## .required()

Make all properties required (opposite of partial).

```typescript
const OptionalUser = z.object({
  id: z.string().optional(),
  name: z.string().optional()
})

// All fields required
const RequiredUser = OptionalUser.required()
// { id: string, name: string }
```

## .extend()

Add new properties to object schema.

```typescript
const Base = z.object({
  id: z.string(),
  name: z.string()
})

// Add new fields
const Extended = Base.extend({
  email: z.string().email(),
  age: z.number()
})
// { id, name, email, age }
```

### Override Properties

```typescript
const Base = z.object({
  id: z.string(),
  name: z.string()
})

// Override existing property
const WithRequiredName = Base.extend({
  name: z.string().min(1).max(100)
})
```

## .safeExtend() (v4)

Extend without overriding existing properties (throws if key exists).

```typescript
const Base = z.object({ id: z.string() })

// Safe extend - prevents accidental override
const Extended = Base.safeExtend({ name: z.string() }) // ✓

// This would throw at schema creation:
// Base.safeExtend({ id: z.string() }) // ✗ Error: key already exists
```

## .merge()

Merge two object schemas.

```typescript
const Base = z.object({
  id: z.string(),
  createdAt: z.date()
})

const Profile = z.object({
  name: z.string(),
  email: z.string().email()
})

// Merge schemas
const User = Base.merge(Profile)
// { id, createdAt, name, email }
```

### Merge vs Extend

```typescript
// merge: Merge another schema
const Merged = SchemaA.merge(SchemaB)

// extend: Add properties object
const Extended = SchemaA.extend({ newField: z.string() })
```

## .keyof()

Get schema of object keys.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
})

// Schema for keys
const UserKey = User.keyof()
// z.enum(["id", "name", "email"])

// Validate key strings
UserKey.parse("id") // ✓
UserKey.parse("name") // ✓
UserKey.parse("unknown") // ✗

// Type inference
type UserKey = z.infer<typeof UserKey> // "id" | "name" | "email"
```

## .setKey()

Add or update a single key.

```typescript
const User = z.object({
  id: z.string()
})

// Add new key
const WithName = User.setKey("name", z.string())
// { id, name }

// Update existing key
const WithRequiredName = User.setKey("name", z.string().min(1))
```

## Common Patterns

### Create/Update Schema Pattern

```typescript
const Base = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user")
})

// Create: all required
const CreateInput = Base

// Update: all optional
const UpdateInput = Base.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field required" }
)

// Response: omit sensitive
const UserResponse = Base.omit({ role: true })
```

### Entity Base Pattern

```typescript
const Entity = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

const User = Entity.extend({
  email: z.string().email(),
  name: z.string()
})

const Product = Entity.extend({
  name: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative()
})
```

### Computed Fields Pattern

```typescript
const Input = z.object({
  firstName: z.string(),
  lastName: z.string()
})

const Output = Input.extend({
  fullName: z.string()
})

// Transform
const WithFullName = Input.transform(data => ({
  ...data,
  fullName: `${data.firstName} ${data.lastName}`
}))
```

### Select/Project Pattern

```typescript
const FullSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Different views
const ListView = FullSchema.pick({ id: true, name: true })
const DetailView = FullSchema.omit({ password: true })
const AuthView = FullSchema.pick({ id: true, role: true })
```

## Method Chaining

```typescript
const Schema = z.object({ id: z.string(), name: z.string() })
  .omit({ id: true })
  .extend({ email: z.string().email() })
  .partial()
  .strict()
// { name?: string, email?: string } - strict mode
```

## Type Inference

```typescript
const Base = z.object({ id: z.string() })

const Extended = Base.extend({ name: z.string() })
type Extended = z.infer<typeof Extended> // { id: string, name: string }

const Partial = Base.partial()
type Partial = z.infer<typeof Partial> // { id?: string | undefined }

const Picked = Base.pick({ id: true })
type Picked = z.infer<typeof Picked> // { id: string }
```

## Tips

1. **Create/Update pattern**: Use partial() for updates
2. **Response sanitization**: Use omit() for sensitive fields
3. **Entity inheritance**: Use extend() for base schemas
4. **Type safety**: All methods preserve type inference
5. **Immutability**: Methods return new schema, don't modify original
