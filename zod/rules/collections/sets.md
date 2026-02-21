# Rule: Set Validation

## Why It Matters

Sets represent collections of unique values. Zod validates Set instances and provides size constraints, useful for unique item collections like tags, permissions, or selected items.

## Basic Usage

```typescript
import { z } from "zod"

// Set of strings
const StringSet = z.set(z.string())

// Set of numbers
const NumberSet = z.set(z.number())

// Type inference
type StringSet = z.infer<typeof StringSet> // Set<string>
```

## Parsing Sets

```typescript
const StringSet = z.set(z.string())

// Must pass a Set instance
const mySet = new Set(["a", "b", "c"])
StringSet.parse(mySet) // ✓ Set { "a", "b", "c" }

// Arrays fail
StringSet.parse(["a", "b", "c"]) // ✗ throws
```

## Size Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum size | `z.set(z.string()).min(1)` |
| `.max(n)` | Maximum size | `z.set(z.string()).max(10)` |
| `.size(n)` | Exact size | `z.set(z.string()).size(5)` |
| `.nonempty()` | At least 1 item | `z.set(z.string()).nonempty()` |

```typescript
// Non-empty set
const Tags = z.set(z.string()).nonempty({
  message: "At least one tag required"
})

// Bounded set
const LimitedSet = z.set(z.number())
  .min(1, "Must have at least 1 item")
  .max(5, "Maximum 5 items")

// Exact size
const ExactlyThree = z.set(z.string())
  .size(3, "Must have exactly 3 items")
```

## Element Validation

```typescript
// Set of emails
const EmailSet = z.set(z.string().email())

// Set of positive integers
const IdSet = z.set(z.number().int().positive())

// Set of enums
const StatusSet = z.set(z.enum(["active", "inactive", "pending"]))
```

## Common Patterns

### Selected Items

```typescript
const SelectedIds = z.set(z.string().uuid())
  .min(1, "Select at least one item")
  .max(100, "Maximum 100 items")

// Form submission with unique selection
```

### Tags/Categories

```typescript
const Tags = z.set(
  z.string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
)
.min(1)
.max(10)
```

### Permissions

```typescript
const Permission = z.enum([
  "read",
  "write",
  "delete",
  "admin"
])

const Permissions = z.set(Permission)
```

### Unique Emails

```typescript
const EmailList = z.set(z.string().email())
  .max(1000, "Maximum 1000 recipients")
```

### Days of Week

```typescript
const DayOfWeek = z.enum([
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
])

const ScheduleDays = z.set(DayOfWeek)
  .min(1, "Select at least one day")
```

## Transform Patterns

### Set to Array

```typescript
const SetToArray = z.set(z.string())
  .transform(set => Array.from(set))

// Useful for JSON serialization
```

### Array to Set

```typescript
const ArrayToSet = z.array(z.string())
  .transform(arr => new Set(arr))

// Deduplicate array
```

### Filter Set

```typescript
const FilteredSet = z.set(z.number())
  .transform(set => {
    const filtered = new Set<number>()
    for (const item of set) {
      if (item > 0) filtered.add(item)
    }
    return filtered
  })
```

### Map Set Values

```typescript
const MappedSet = z.set(z.string())
  .transform(set => {
    const mapped = new Set<string>()
    for (const item of set) {
      mapped.add(item.toLowerCase())
    }
    return mapped
  })
```

## Set vs Array

| Feature | z.set() | z.array() |
|---------|---------|-----------|
| Uniqueness | Guaranteed | Not guaranteed |
| Input type | Set instance | Array |
| Order | Not preserved | Preserved |
| Duplicate handling | Automatic | Manual |

```typescript
// Use Set for uniqueness
const UniqueTags = z.set(z.string())

// Use Array for ordered lists
const OrderedItems = z.array(z.string())
```

## Empty Sets

```typescript
// Empty set passes by default
z.set(z.string()).parse(new Set()) // ✓

// Require non-empty
const NonEmpty = z.set(z.string()).nonempty()
NonEmpty.parse(new Set()) // ✗ throws
```

## Type Inference

```typescript
const schema = z.set(z.string())
type Inferred = z.infer<typeof schema> // Set<string>

const ComplexSet = z.set(z.object({
  id: z.string(),
  name: z.string()
}))
type Complex = z.infer<typeof ComplexSet>
// Set<{ id: string; name: string }>
```

## Edge Cases

```typescript
// null/undefined fail
z.set(z.string()).parse(null) // ✗
z.set(z.string()).parse(undefined) // ✗

// Arrays fail
z.set(z.string()).parse([]) // ✗

// Empty Set passes
z.set(z.string()).parse(new Set()) // ✓

// Duplicates automatically handled
const dedupe = z.set(z.number()).parse(new Set([1, 1, 2, 2, 3]))
// Set { 1, 2, 3 }
```

## Working with Sets in TypeScript

```typescript
const IdSet = z.set(z.string().uuid())

type IdSet = z.infer<typeof IdSet>

function processIds(ids: IdSet) {
  for (const id of ids) {
    console.log(id)
  }
  console.log(`Total unique IDs: ${ids.size}`)
}

// Validate at boundary
const input = new Set([
  "uuid-1",
  "uuid-2",
  "uuid-3"
])
const validated = IdSet.parse(input)
processIds(validated)
```

## Tips

1. **Use Set for uniqueness**: Automatic deduplication
2. **Transform to array for JSON**: Sets don't serialize to JSON
3. **Use array to Set for deduping**: Transform validates and dedupes
4. **Empty sets pass by default**: Add nonempty() for required items
5. **Order not preserved**: Use array if order matters
