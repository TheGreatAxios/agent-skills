# Rule: Map Validation

## Why It Matters

Maps provide key-value storage with any key type (not just strings). Zod validates Map instances and can transform between Maps and plain objects.

## Basic Usage

```typescript
import { z } from "zod"

// Map with string keys, number values
const NumberMap = z.map(z.string(), z.number())

// Type inference
type NumberMap = z.infer<typeof NumberMap> // Map<string, number>
```

## Parsing Maps

```typescript
const StringNumberMap = z.map(z.string(), z.number())

// Must pass a Map instance
const myMap = new Map([["a", 1], ["b", 2]])
StringNumberMap.parse(myMap) // ✓ Map { "a" => 1, "b" => 2 }

// Plain objects fail
StringNumberMap.parse({ a: 1, b: 2 }) // ✗ throws
```

## Key and Value Schemas

```typescript
// Complex key type
const ObjectKeyMap = z.map(
  z.object({ id: z.string() }),
  z.string()
)

// Complex value type
const UserMap = z.map(
  z.string(),
  z.object({
    name: z.string(),
    email: z.string().email()
  })
)
```

## Common Patterns

### User ID to User Map

```typescript
const UserMap = z.map(
  z.string().uuid(),
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email()
  })
)
```

### String to Any Map

```typescript
const ConfigMap = z.map(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
)
```

### Numeric Key Map

```typescript
// ID -> Score mapping
const ScoreMap = z.map(z.number().int(), z.number().min(0).max(100))
```

### Enum Key Map

```typescript
const Role = z.enum(["admin", "user", "guest"])

const PermissionsMap = z.map(
  Role,
  z.array(z.string())
)

// Map where each role maps to list of permissions
```

## Transform Patterns

### Map to Object

```typescript
const MapToObject = z.map(z.string(), z.number())
  .transform(map => Object.fromEntries(map))

const result = MapToObject.parse(new Map([["a", 1], ["b", 2]]))
// { a: 1, b: 2 }
```

### Object to Map

```typescript
const ObjectToMap = z.record(z.number())
  .transform(obj => new Map(Object.entries(obj)))

const result = ObjectToMap.parse({ a: 1, b: 2 })
// Map { "a" => 1, "b" => 2 }
```

### Map to Array of Entries

```typescript
const MapToEntries = z.map(z.string(), z.number())
  .transform(map => Array.from(map.entries()))
// [["a", 1], ["b", 2]]
```

### Filter Map Values

```typescript
const FilteredMap = z.map(z.string(), z.number())
  .transform(map => {
    const filtered = new Map<string, number>()
    for (const [k, v] of map) {
      if (v > 0) filtered.set(k, v)
    }
    return filtered
  })
```

## Map vs Record

| Feature | z.map() | z.record() |
|---------|---------|------------|
| Key type | Any | String/Number |
| Input type | Map instance | Plain object |
| Runtime | Map | Object |
| Key order | Preserved | Not guaranteed |
| Non-string keys | ✓ | ✗ |

```typescript
// Use Map for non-string keys
const NumericKeys = z.map(z.number(), z.string())

// Use Record for string keys with objects
const StringKeys = z.record(z.string())
```

## Empty Maps

```typescript
// Empty map is valid
const EmptyMap = z.map(z.string(), z.number())
EmptyMap.parse(new Map()) // ✓

// Require non-empty with refine
const NonEmptyMap = z.map(z.string(), z.number())
  .refine(map => map.size > 0, { message: "Map cannot be empty" })
```

## Type Inference

```typescript
const schema = z.map(z.string(), z.number())
type Inferred = z.infer<typeof schema> // Map<string, number>

const ComplexMap = z.map(
  z.object({ id: z.string() }),
  z.array(z.number())
)
type Complex = z.infer<typeof ComplexMap>
// Map<{ id: string }, number[]>
```

## Edge Cases

```typescript
// null/undefined fail
z.map(z.string(), z.number()).parse(null) // ✗
z.map(z.string(), z.number()).parse(undefined) // ✗

// Plain objects fail
z.map(z.string(), z.number()).parse({}) // ✗

// Empty Map passes
z.map(z.string(), z.number()).parse(new Map()) // ✓

// Invalid key fails
const StringKeyMap = z.map(z.string(), z.number())
StringKeyMap.parse(new Map([[1, "a"]])) // ✗ key must be string
```

## Working with Maps in TypeScript

```typescript
// Create typed Map
const UserMap = z.map(z.string(), z.object({
  name: z.string(),
  age: z.number()
}))

type UserMap = z.infer<typeof UserMap>

// Use in code
function processUsers(users: UserMap) {
  for (const [id, user] of users) {
    console.log(`${id}: ${user.name}, ${user.age}`)
  }
}

// Validate at boundary
const input = new Map([
  ["user1", { name: "Alice", age: 30 }],
  ["user2", { name: "Bob", age: 25 }]
])
const validated = UserMap.parse(input)
processUsers(validated)
```

## Tips

1. **Use Map for non-string keys**: Records only support string keys
2. **Transform to object for JSON**: Maps don't serialize to JSON
3. **Use object to Map transform**: For converting plain objects
4. **Empty maps pass by default**: Add refine for non-empty requirement
5. **Preserves insertion order**: Unlike plain objects (ES6+)
