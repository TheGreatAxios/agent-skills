# Rule: Intersection Types

## Why It Matters

Intersections combine multiple schemas into one - a value must satisfy ALL schemas. Use for mixins, extending base schemas, and combining constraints.

## z.intersection()

Value must satisfy both schemas.

```typescript
import { z } from "zod"

// Intersection of two objects
const A = z.object({ a: z.string() })
const B = z.object({ b: z.number() })

const AB = z.intersection(A, B)

// Must have both a and b
AB.parse({ a: "hello", b: 42 }) // ✓
AB.parse({ a: "hello" }) // ✗ missing b
AB.parse({ b: 42 }) // ✗ missing a

// Type inference
type AB = z.infer<typeof AB> // { a: string } & { b: number }
```

## Intersection Syntax

```typescript
// Function syntax
const Intersect1 = z.intersection(SchemaA, SchemaB)

// .and() method chaining
const Intersect2 = SchemaA.and(SchemaB)

// Multiple .and() calls
const Multi = SchemaA
  .and(SchemaB)
  .and(SchemaC)
```

## Common Patterns

### Mixin Pattern

```typescript
const Timestamps = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

const Identifiable = z.object({
  id: z.string().uuid()
})

const SoftDeletable = z.object({
  deletedAt: z.coerce.date().nullable()
})

// Combine mixins
const Entity = z.intersection(
  z.intersection(Identifiable, Timestamps),
  SoftDeletable
)

// Or with .and()
const EntityAlt = Identifiable
  .and(Timestamps)
  .and(SoftDeletable)
```

### Extending Schemas

```typescript
const BaseUser = z.object({
  id: z.string(),
  email: z.string().email()
})

const UserProfile = z.object({
  name: z.string(),
  avatar: z.string().url().optional()
})

const User = z.intersection(BaseUser, UserProfile)
// Equivalent to BaseUser.extend({ name, avatar })
```

### Combining Constraints

```typescript
// String that's also non-empty
const NonEmptyString = z.intersection(
  z.string(),
  z.string().min(1)
)

// Number that's positive and integer
const PositiveInt = z.intersection(
  z.number().positive(),
  z.number().int()
)
// Or equivalently: z.number().positive().int()
```

### Permission-Based Schema

```typescript
const BaseSchema = z.object({
  title: z.string(),
  content: z.string()
})

const AdminFields = z.object({
  featured: z.boolean(),
  publishedAt: z.date().nullable()
})

const Article = z.intersection(BaseSchema, AdminFields)
```

### API Entity with Relations

```typescript
const Resource = z.object({
  id: z.string().uuid(),
  type: z.string()
})

const WithOwner = z.object({
  ownerId: z.string().uuid(),
  owner: z.object({
    id: z.string(),
    name: z.string()
  }).optional()
})

const OwnedResource = Resource.and(WithOwner)
```

## Intersection vs Merge

```typescript
const A = z.object({ a: z.string() })
const B = z.object({ b: z.number() })

// Intersection - both must be satisfied
const Intersect = z.intersection(A, B)
// { a: string, b: number }

// Merge - combine objects
const Merged = A.merge(B)
// { a: string, b: number }

// Results are equivalent for compatible objects
// Prefer merge() for objects - cleaner semantics
```

## Overlapping Properties

When properties overlap, the intersection requires values to satisfy BOTH schemas:

```typescript
const A = z.object({
  value: z.string()
})

const B = z.object({
  value: z.string().min(5)
})

const AB = z.intersection(A, B)

// Value must be string AND at least 5 chars
AB.parse({ value: "hello" }) // ✓
AB.parse({ value: "hi" }) // ✗ fails min(5)
```

### Conflicting Types

```typescript
const A = z.object({ value: z.string() })
const B = z.object({ value: z.number() })

const AB = z.intersection(A, B)

// Impossible to satisfy - value can't be both string and number
AB.parse({ value: "hello" }) // ✗ fails B
AB.parse({ value: 42 }) // ✗ fails A
```

## Intersection with Primitives

```typescript
// Valid: combining constraints
const PositiveInt = z.intersection(
  z.number(),
  z.number().int().positive()
)

// Use chaining instead for clarity
const PositiveIntAlt = z.number().int().positive()
```

## Transform with Intersection

```typescript
const Base = z.object({ firstName: z.string(), lastName: z.string() })
const WithFullName = z.object({ fullName: z.string() })

const Transform = Base.transform(data => ({
  ...data,
  fullName: `${data.firstName} ${data.lastName}`
}))

// Intersection after transform
const Person = z.intersection(Transform, WithFullName)
```

## Type Inference

```typescript
const A = z.object({ a: z.string() })
const B = z.object({ b: z.number() })

const AB = z.intersection(A, B)
type AB = z.infer<typeof AB> // { a: string } & { b: number }
// TypeScript simplifies to: { a: string; b: number }
```

## Edge Cases

```typescript
// Empty intersection
z.intersection(z.object({}), z.object({}))
// Matches any object

// Self-intersection
z.intersection(z.string(), z.string())
// Equivalent to z.string()

// Impossible intersection
z.intersection(z.string(), z.number())
// Can never be satisfied
```

## Performance Note

Intersection tries both schemas and merges results. For object schemas, prefer `.merge()` or `.extend()` which are more efficient:

```typescript
// Slower: intersection
const Slow = z.intersection(A, B)

// Faster: merge (for objects)
const Fast = A.merge(B)

// Or extend
const FastAlt = A.extend({ b: z.number() })
```

## Tips

1. **Use merge/extend for objects**: More efficient than intersection
2. **Use for mixins**: Combine reusable schema fragments
3. **Watch overlapping props**: Must satisfy all constraints
4. **Impossible intersections**: Avoid string & number type conflicts
5. **Chain constraints instead**: For same-type constraints
