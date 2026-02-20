# Rule: Function Schemas

## Why It Matters

Function schemas validate function types at runtime. Use for callbacks, higher-order functions, and runtime type checking of function signatures.

## z.function()

Define function signature schema.

```typescript
import { z } from "zod"

// Function with no arguments, returns string
const StringFactory = z.function()
  .returns(z.string())

// Type inference
type StringFactory = z.infer<typeof StringFactory>
// () => string
```

## Arguments

```typescript
// Function with arguments
const Add = z.function()
  .args(z.number(), z.number())
  .returns(z.number())

type Add = z.infer<typeof Add>
// (arg0: number, arg1: number) => number
```

## Implementing Functions

### .implement()

Create type-safe implementation.

```typescript
const Add = z.function()
  .args(z.number(), z.number())
  .returns(z.number())

const add = Add.implement((a, b) => a + b)

add(1, 2) // 3
add("1", 2) // ✗ throws - invalid argument
```

### .implementAsync()

Async function implementation.

```typescript
const FetchUser = z.function()
  .args(z.string().uuid())
  .returns(z.promise(z.object({
    id: z.string(),
    name: z.string()
  })))

const fetchUser = FetchUser.implement(async (id) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

const user = await fetchUser("123e4567-e89b-12d3-a456-426614174000")
```

## Common Patterns

### Callback Functions

```typescript
const Callback = z.function()
  .args(z.string(), z.number())
  .returns(z.void())

type Callback = z.infer<typeof Callback>
// (arg0: string, arg1: number) => void

// Use in object schema
const EventEmitter = z.object({
  onEvent: Callback,
  onError: z.function()
    .args(z.instanceof(Error))
    .returns(z.void())
})
```

### Transform Functions

```typescript
const Transformer = z.function()
  .args(z.string())
  .returns(z.string())

const upperCase = Transformer.implement(s => s.toUpperCase())
```

### Predicate Functions

```typescript
const Predicate = z.function()
  .args(z.unknown())
  .returns(z.boolean())

const isString = Predicate.implement((val) => typeof val === "string")
```

### Comparator Functions

```typescript
const Comparator = z.function()
  .args(z.number(), z.number())
  .returns(z.number())

const compare = Comparator.implement((a, b) => a - b)
```

### Factory Functions

```typescript
const Factory = z.function()
  .args(z.object({
    name: z.string(),
    age: z.number()
  }))
  .returns(z.object({
    id: z.string(),
    name: z.string(),
    age: z.number(),
    createdAt: z.date()
  }))

const createUser = Factory.implement((data) => ({
  id: crypto.randomUUID(),
  ...data,
  createdAt: new Date()
}))
```

## Variadic Arguments

```typescript
// Zod doesn't directly support rest parameters
// Workaround: Use array argument
const Variadic = z.function()
  .args(z.array(z.number()))
  .returns(z.number())

const sum = Variadic.implement((numbers) =>
  numbers.reduce((a, b) => a + b, 0)
)

sum([1, 2, 3, 4]) // 10
```

## Optional Arguments

```typescript
// Optional via union with undefined
const WithOptional = z.function()
  .args(
    z.string(),
    z.number().optional()
  )
  .returns(z.string())

const greet = WithOptional.implement((name, times = 1) =>
  Array(times).fill(`Hello, ${name}!`).join(" ")
)

greet("Alice") // "Hello, Alice!"
greet("Bob", 2) // "Hello, Bob! Hello, Bob!"
```

## Method Schema

```typescript
// Object method
const Service = z.object({
  name: z.string(),
  process: z.function()
    .args(z.string())
    .returns(z.string())
})

type Service = z.infer<typeof Service>
// {
//   name: string
//   process: (arg0: string) => string
// }
```

## Higher-Order Functions

```typescript
// Function that takes a function
const MapFunction = z.function()
  .args(
    z.array(z.number()),
    z.function().args(z.number()).returns(z.number())
  )
  .returns(z.array(z.number()))

const mapNumbers = MapFunction.implement((arr, fn) => arr.map(fn))

mapNumbers([1, 2, 3], n => n * 2) // [2, 4, 6]
```

## Validation at Runtime

```typescript
const SafeFunction = z.function()
  .args(z.number().positive(), z.number().positive())
  .returns(z.number())

const safeDivide = SafeFunction.implement((a, b) => a / b)

safeDivide(10, 2) // 5
safeDivide(-1, 2) // ✗ throws - first arg must be positive
safeDivide(10, 0) // 5 - runtime validation only, doesn't check div by zero
```

## Type Inference

```typescript
// Basic function
const Fn = z.function()
  .args(z.string())
  .returns(z.number())

type Fn = z.infer<typeof Fn>
// (arg0: string) => number

// Multiple arguments
const MultiArg = z.function()
  .args(z.string(), z.number(), z.boolean())
  .returns(z.void())

type MultiArg = z.infer<typeof MultiArg>
// (arg0: string, arg1: number, arg2: boolean) => void
```

## Tips

1. **Use .implement()**: Wraps function with runtime validation
2. **Args are positional**: No named parameters
3. **Returns is required**: Must specify return type
4. **Async returns Promise**: Use z.promise() for async
5. **Combine with objects**: For method definitions
