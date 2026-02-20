# Rule: Array Validation

## Why It Matters

Arrays are fundamental for lists, collections, and repeated data. Zod provides length constraints, element validation, and transformation methods for comprehensive array handling.

## Basic Usage

```typescript
import { z } from "zod"

// Array of strings
const Names = z.array(z.string())

// Array of objects
const Users = z.array(z.object({
  id: z.string(),
  name: z.string()
}))

// Type inference
type Names = z.infer<typeof Names> // string[]
```

## Access Element Schema

```typescript
const Numbers = z.array(z.number().int())

// Access element schema
Numbers.element // ZodNumber
```

## Length Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum items | `z.array(z.string()).min(1)` |
| `.max(n)` | Maximum items | `z.array(z.string()).max(10)` |
| `.length(n)` | Exact length | `z.array(z.string()).length(5)` |
| `.nonempty()` | At least 1 item | `z.array(z.string()).nonempty()` |

```typescript
// Non-empty array
const Tags = z.array(z.string()).nonempty({
  message: "At least one tag required"
})

// Bounded array
const Items = z.array(z.string())
  .min(1, "Must have at least 1 item")
  .max(10, "Maximum 10 items allowed")

// Exact length
const Coordinates = z.array(z.number())
  .length(2, "Must be [x, y]")

// Validate length
z.array(z.string()).length(3).parse(["a", "b", "c"]) // ✓
z.array(z.string()).length(3).parse(["a", "b"]) // ✗ throws
```

## Element Validation

```typescript
// Array of validated items
const Emails = z.array(z.string().email())

// Array of numbers with constraints
const Scores = z.array(
  z.number().int().min(0).max(100)
)

// Array of enums
const Statuses = z.array(
  z.enum(["active", "inactive", "pending"])
)

// Nested arrays (matrix)
const Matrix = z.array(z.array(z.number()))
```

## Unique Items

```typescript
// Array with unique items
const UniqueIds = z.array(z.string()).unique()

// Unique with custom message
const UniqueTags = z.array(z.string()).unique({
  message: "Duplicate tags are not allowed"
})
```

## Transformations

### Filter

```typescript
const NonEmptyStrings = z.array(z.string())
  .transform(arr => arr.filter(s => s.length > 0))
```

### Sort

```typescript
const SortedNumbers = z.array(z.number())
  .transform(arr => [...arr].sort((a, b) => a - b))
```

### Map

```typescript
const UppercaseNames = z.array(z.string())
  .transform(arr => arr.map(s => s.toUpperCase()))
```

### Dedupe

```typescript
const UniqueArray = z.array(z.string())
  .transform(arr => [...new Set(arr)])
```

### Flatten

```typescript
const FlatArray = z.array(z.array(z.string()))
  .transform(arr => arr.flat())
```

## Common Patterns

### Pagination Response

```typescript
const PaginatedResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int(),
    page: z.number().int(),
    perPage: z.number().int(),
    hasMore: z.boolean()
  })

const UserResponse = PaginatedResponse(z.object({
  id: z.string(),
  name: z.string()
}))
```

### Bulk Operations

```typescript
const BulkCreate = z.object({
  items: z.array(z.object({
    name: z.string(),
    email: z.string().email()
  })).min(1).max(100),
  skipErrors: z.boolean().default(false)
})

const BulkDelete = z.object({
  ids: z.array(z.string().uuid())
    .min(1, "Select at least one item")
    .max(1000, "Maximum 1000 items at once")
})
```

### Tags/Categories

```typescript
const Tags = z.array(
  z.string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
)
.min(1, "At least one tag required")
.max(10, "Maximum 10 tags")
```

### Coordinates

```typescript
// 2D point
const Point = z.array(z.number()).length(2)

// 3D point
const Point3D = z.array(z.number()).length(3)

// Bounding box [minX, minY, maxX, maxY]
const BoundingBox = z.array(z.number()).length(4)
```

### Order By

```typescript
const SortOption = z.object({
  field: z.string(),
  direction: z.enum(["asc", "desc"])
})

const Query = z.object({
  sortBy: z.array(SortOption).default([])
})
```

## Nested Arrays

```typescript
// 2D grid
const Grid = z.array(z.array(z.number()))

// Matrix with row constraints
const Matrix = z.array(
  z.array(z.number()).length(3) // Each row has 3 elements
).length(3) // 3 rows

// Ragged array (variable row lengths)
const RaggedArray = z.array(z.array(z.string()))
```

## Nonempty vs Min(1)

```typescript
// These are equivalent
const A = z.array(z.string()).nonempty()
const B = z.array(z.string()).min(1)

// nonempty() is semantically clearer for "at least one"
// min(1) is clearer when expressing numeric constraints
```

## Type Inference

```typescript
const schema = z.array(z.string())
type Inferred = z.infer<typeof schema> // string[]

const nonempty = z.array(z.string()).nonempty()
type Nonempty = z.infer<typeof nonempty> // [string, ...string[]]

const optional = z.array(z.string()).optional()
type Optional = z.infer<typeof optional> // string[] | undefined
```

## Edge Cases

```typescript
// Empty array passes by default
z.array(z.string()).parse([]) // ✓ []

// Use nonempty() to require items
z.array(z.string()).nonempty().parse([]) // ✗ throws

// null/undefined are not arrays
z.array(z.string()).parse(null) // ✗ throws
z.array(z.string()).parse(undefined) // ✗ throws

// Array-like objects don't pass
z.array(z.string()).parse({ 0: "a", length: 1 }) // ✗ throws
```

## Tips

1. **Use nonempty() semantically**: Clearer than min(1) for "must have items"
2. **Validate element types**: Add constraints to inner schema
3. **Transform for cleanup**: Filter, map, dedupe after validation
4. **Limit max length**: Prevent DoS with large arrays
5. **Use generics for pagination**: Create reusable response schemas
