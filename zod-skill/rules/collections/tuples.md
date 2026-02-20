# Rule: Tuple Validation

## Why It Matters

Tuples represent fixed-length arrays where each position has a specific type. Use for coordinate pairs, key-value pairs, and heterogeneous collections with positional meaning.

## Basic Usage

```typescript
import { z } from "zod"

// Fixed-length tuple
const Coordinate = z.tuple([z.number(), z.number()])

// Parse
Coordinate.parse([10, 20]) // ✓ [10, 20]
Coordinate.parse([10]) // ✗ throws (wrong length)
Coordinate.parse([10, 20, 30]) // ✗ throws (wrong length)

// Type inference
type Coordinate = z.infer<typeof Coordinate> // [number, number]
```

## Mixed Types

```typescript
// Heterogeneous tuple
const KeyValue = z.tuple([z.string(), z.number()])

// API response tuple
const Result = z.tuple([
  z.boolean(),       // success
  z.string(),        // message
  z.object({})       // data
])
```

## Accessing Elements

```typescript
const Tuple = z.tuple([z.string(), z.number(), z.boolean()])

// Access items array
Tuple.items // [ZodString, ZodNumber, ZodBoolean]
```

## Rest Parameter

Add variable-length tail to tuple.

```typescript
// String followed by any number of numbers
const NameAndScores = z.tuple([z.string()]).rest(z.number())

NameAndScores.parse(["Alice"]) // ✓
NameAndScores.parse(["Alice", 90]) // ✓
NameAndScores.parse(["Alice", 90, 85, 95]) // ✓
NameAndScores.parse([90, 85]) // ✗ throws (first must be string)

// Type inference
type NameAndScores = z.infer<typeof NameAndScores>
// [string, ...number[]]
```

### Common Rest Patterns

```typescript
// Command with arguments
const Command = z.tuple([
  z.string()  // command name
]).rest(z.union([z.string(), z.number()]))
// ["run", "script", 3]

// Mixed with rest
const MixedTuple = z.tuple([
  z.string(),
  z.number()
]).rest(z.boolean())
// ["label", 42, true, false, true]
```

## Common Patterns

### Coordinate Pairs

```typescript
// 2D point
const Point2D = z.tuple([z.number(), z.number()])

// 3D point
const Point3D = z.tuple([z.number(), z.number(), z.number()])

// With constraints
const ScreenPoint = z.tuple([
  z.number().int().min(0).max(1920),
  z.number().int().min(0).max(1080)
])
```

### RGB Color

```typescript
const RGB = z.tuple([
  z.number().int().min(0).max(255),  // R
  z.number().int().min(0).max(255),  // G
  z.number().int().min(0).max(255)   // B
])

// RGBA
const RGBA = z.tuple([
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
  z.number().min(0).max(1)  // Alpha
])
```

### Date Range

```typescript
const DateRange = z.tuple([
  z.coerce.date(),
  z.coerce.date()
]).refine(
  ([start, end]) => start <= end,
  { message: "Start must be before end" }
)
```

### Key-Value Entry

```typescript
const Entry = z.tuple([z.string(), z.unknown()])

// Parse Map entries
const Entries = z.array(Entry)
```

### Function Arguments

```typescript
// Validate function arguments
const Args = z.tuple([
  z.string(),
  z.number().positive(),
  z.object({ debug: z.boolean() }).optional()
])
```

### RegExp Match

```typescript
// Full regex match result
const RegexMatch = z.tuple([
  z.string(),            // Full match
  z.string().optional(), // First capture group
  z.string().optional()  // Second capture group
])
```

## Tuple vs Array

| Feature | Tuple | Array |
|---------|-------|-------|
| Length | Fixed | Variable |
| Types | Position-specific | Uniform |
| Inference | `[A, B, C]` | `T[]` |
| Use case | Coordinates, pairs | Lists, collections |

```typescript
// Use tuple for positional meaning
const Point = z.tuple([z.number(), z.number()])
// First is X, second is Y

// Use array for lists
const Numbers = z.array(z.number())
// All elements are numbers
```

## Type Inference

```typescript
// Basic tuple
const Tuple2 = z.tuple([z.string(), z.number()])
type T2 = z.infer<typeof Tuple2> // [string, number]

// With rest
const WithRest = z.tuple([z.string()]).rest(z.number())
type WR = z.infer<typeof WithRest> // [string, ...number[]]

// Optional (makes entire tuple optional)
const Optional = z.tuple([z.string()]).optional()
type Opt = z.infer<typeof Optional> // [string] | undefined
```

## Edge Cases

```typescript
// Empty tuple
const Empty = z.tuple([])
Empty.parse([]) // ✓
Empty.parse([1]) // ✗ throws

// Single element
const Single = z.tuple([z.string()])
Single.parse(["hello"]) // ✓

// Nested tuples
const Nested = z.tuple([
  z.tuple([z.string(), z.number()]),
  z.boolean()
])
Nested.parse([["a", 1], true]) // ✓
```

## Transform Patterns

### To Object

```typescript
const Point = z.tuple([z.number(), z.number()])
  .transform(([x, y]) => ({ x, y }))

Point.parse([10, 20]) // { x: 10, y: 20 }
```

### To Array

```typescript
const StrictTuple = z.tuple([z.string(), z.number()])
  .transform(tuple => [...tuple])
// Returns array, losing tuple type
```

### Destructure

```typescript
const Pair = z.tuple([z.string(), z.number()])
  .transform(([key, value]) => ({ key, value }))
```

## Tips

1. **Use for fixed positions**: When position has semantic meaning
2. **Use rest for trailing items**: Variable-length tail
3. **Consider objects instead**: For better readability with many fields
4. **Destructure in transforms**: Clean pattern for conversion
5. **Coordinates are classic tuple**: X, Y pairs, RGB values
