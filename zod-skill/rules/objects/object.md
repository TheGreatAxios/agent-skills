# Rule: Object Schemas

## Why It Matters

Objects are the most common schema type for structured data. Understanding object validation, property access, and type inference is fundamental to effective Zod usage.

## Basic Usage

```typescript
import { z } from "zod"

// Basic object schema
const User = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().optional()
})

// Type inference
type User = z.infer<typeof User>
// {
//   id: string
//   name: string
//   email: string
//   age?: number | undefined
// }
```

## Object Shape

### Accessing the Shape

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
})

// Access shape
User.shape // { id: ZodString, name: ZodString }
User.shape.id // ZodString
User.shape.name // ZodString
```

### Dynamic Shape

```typescript
// Build shape dynamically
const fields = {
  id: z.string(),
  name: z.string()
}

const DynamicSchema = z.object(fields)
```

## Property Types

### Required Properties

```typescript
const Required = z.object({
  name: z.string(),      // Required
  email: z.string()      // Required
})

// All properties must be present
```

### Optional Properties

```typescript
const WithOptional = z.object({
  name: z.string(),
  nickname: z.string().optional(),  // string | undefined
  age: z.number().optional()        // number | undefined
})
```

### Nullable Properties

```typescript
const WithNullable = z.object({
  name: z.string(),
  middleName: z.string().nullable(),  // string | null
  bio: z.string().nullable().optional() // string | null | undefined
})
```

### Nullish Properties

```typescript
const WithNullish = z.object({
  name: z.string(),
  nickname: z.string().nullish() // string | null | undefined
})
```

### Default Values

```typescript
const WithDefaults = z.object({
  name: z.string(),
  role: z.string().default("user"),
  active: z.boolean().default(true),
  settings: z.object({
    theme: z.string().default("light")
  }).default({})
})
```

## Nested Objects

```typescript
const Address = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string()
})

const User = z.object({
  id: z.string(),
  name: z.string(),
  address: Address,
  preferences: z.object({
    newsletter: z.boolean().default(false),
    notifications: z.boolean().default(true)
  })
})

// Type inference includes nested types
type User = z.infer<typeof User>
```

## Record Properties

```typescript
// Object with dynamic keys
const Config = z.object({
  name: z.string(),
  metadata: z.record(z.string()), // { [key: string]: string }
  counts: z.record(z.number())    // { [key: string]: number }
})
```

## Custom Error Messages

```typescript
const User = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }),
  email: z.string().email("Invalid email format")
})
```

## Object-Level Validation

### refine

```typescript
const User = z.object({
  password: z.string(),
  confirmPassword: z.string()
}).refine(
  data => data.password === data.confirmPassword,
  { message: "Passwords don't match" }
)
```

### superRefine

```typescript
const Registration = z.object({
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  acceptTerms: z.boolean()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirmPassword"]
    })
  }
  if (!data.acceptTerms) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must accept terms",
      path: ["acceptTerms"]
    })
  }
})
```

## Async Validation

```typescript
const User = z.object({
  email: z.string().email(),
  username: z.string()
}).refine(
  async (data) => {
    // Check if email is available
    const exists = await checkEmailExists(data.email)
    return !exists
  },
  { message: "Email already registered" }
)

// Use parseAsync
const result = await User.parseAsync(data)
```

## Parsing Behavior

```typescript
const User = z.object({
  name: z.string(),
  age: z.number()
})

// By default, extra keys are stripped
User.parse({ name: "John", age: 30, extra: "ignored" })
// { name: "John", age: 30 }

// Missing keys throw
User.parse({ name: "John" })
// ZodError: Required at "age"

// Wrong types throw
User.parse({ name: "John", age: "30" })
// ZodError: Expected number at "age"
```

## Common Patterns

### Entity with ID

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
```

### API Request

```typescript
const CreateRequest = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user")
})

const UpdateRequest = CreateRequest.partial()
```

### Pagination Params

```typescript
const Pagination = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc")
})
```

### Form Data

```typescript
const ContactForm = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject too short"),
  message: z.string().min(10, "Message too short")
})
```

## Type Utilities

### z.infer

```typescript
const Schema = z.object({ name: z.string() })
type Type = z.infer<typeof Schema> // { name: string }
```

### z.input

```typescript
// Input type (before transformations)
const Schema = z.object({
  count: z.coerce.number() // Input: string | number, Output: number
})

type Input = z.input<typeof Schema>  // { count: string | number }
type Output = z.infer<typeof Schema> // { count: number }
```

### z.output

```typescript
type Output = z.output<typeof Schema> // Same as z.infer for objects
```

## Tips

1. **Use .extend() for composition**: Build on base schemas
2. **Nested objects**: Define separately for reusability
3. **Default values**: Use for optional config fields
4. **Object refinement**: Cross-field validation at object level
5. **Type inference**: Always use z.infer for TypeScript types
