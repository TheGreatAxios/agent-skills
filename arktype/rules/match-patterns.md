# Rule: match-patterns

## Why It Matters

ArkType's `match` function provides ergonomic pattern matching with type safety, discriminated unions, and fluent API. It's faster than ts-pattern with better type inference.

## Basic Match

### Case Record API

```typescript
import { match } from "arktype"

const sizeOf = match({
  "string | Array": v => v.length,
  number: v => v,
  bigint: v => v,
  default: "assert"
})

sizeOf("hello")  // 5
sizeOf([1,2,3])  // 3
sizeOf(42n)  // 42n
sizeOf(true)  // throws: must be string, Array, number, or bigint
```

### Fluent API

```typescript
const sizeOf = match({
  string: v => v.length,
  number: v => v
})
.case({ length: "number" }, o => o.length)
.default(() => 0)

sizeOf("abc")  // 3
sizeOf({ length: 5 })  // 5
sizeOf(null)  // 0
```

## Discriminated Unions

### Define Union Type

```typescript
type Event =
  | { type: "click", x: number, y: number }
  | { type: "keydown", key: string }
  | { type: "scroll", delta: number }
```

### Match on Property

```typescript
const handleEvent = match
  .in<Event>()  // specify input type
  .at("type")   // match on this key
  .match({
    click: e => `Clicked at (${e.x}, ${e.y})`,
    keydown: e => `Pressed ${e.key}`,
    scroll: e => `Scrolled ${e.delta}`
  })
  .default(e => `Unknown event: ${e.type}`)

handleEvent({ type: "click", x: 100, y: 200 })
// "Clicked at (100, 200)"
```

### Without .in()

```typescript
const handle = match
  .at("type")
  .match({
    click: e => e.x,
    keydown: e => e.key
  })
  .default("assert")
```

## Match Methods

| Method | Purpose |
|--------|---------|
| `.match(cases)` | Define case record |
| `.case(pattern, fn)` | Add case (fluent) |
| `.default(fn)` | Add default handler |
| `.in<T>()` | Specify input type |
| `.at(key)` | Match on property key |

## Type Narrowing

### Type Predicates

```typescript
const parseJson = match
  .in<string | object>()
  .match({
    string: s => JSON.parse(s),
    object: o => o
  })
  .default("assert")

const result = parseJson(validInput)
// Type is object (string case narrowed to return type)
```

### Union Extraction

```typescript
const getValue = match
  .in<{ value: string } | { value: number }>()
  .match({
    "value: string": o => o.value.toUpperCase(),
    "value: number": o => o.value * 2
  })
  .default("assert")
```

## Advanced Patterns

### Nested Matching

```typescript
const deepMatch = match({
  string: s => s.length,
  number: n => n,
  object: match({
    array: a => a.length,
    date: d => d.getTime()
  })
})
```

### Chaining Multiple Cases

```typescript
const matcher = match({
  string: s => s
})
.case((x: boolean) => x ? "yes" : "no")
.case((x: number) => x.toString())
.default(() => "unknown")
```

### With Custom Types

```typescript
const User = type({ id: "string", name: "string" })
const Admin = type({ ...User, permissions: "string[]" })

const getRole = match({
  [User]: u => "user",
  [Admin]: a => "admin"
}).default(() => "guest")
```

## Performance Notes

ArkType's `match` is faster than ts-pattern:

```typescript
// ArkType: ~9ns per call
const toJsonArkType = match({
  "string | number | boolean | null": v => v,
  bigint: b => `${b}n`,
  object: o => { for (const k in o) o[k] = toJsonArkType(o[k]); return o }
})

// ts-pattern: ~765ns per call (85x slower!)
```

## Match vs Type.union

| Feature | `match` | `.or()` |
|---------|--------|---------|
| Runtime branching | Yes | No |
| Type narrowing | Yes | Yes |
| Custom handlers | Yes | No |
| Performance | Optimized | Static |

## Common Patterns

### Type-safe Event Handler

```typescript
type Msg =
  | { type: "ping", id: number }
  | { type: "pong", id: number }
  | { type: "exit" }

const handle = match
  .in<Msg>()
  .at("type")
  .match({
    ping: m => ({ type: "pong", id: m.id }),
    pong: m => console.log("got pong", m.id),
    exit: () => process.exit(0)
  })
  .default("assert")
```

### Fallback Value

```typescript
const getOrElse = match
  .in<string | number | undefined>()
  .match({
    string: s => s,
    number: n => n.toString()
  })
  .default(() => "default value")
```

### Exhaustiveness Check

```typescript
const exhaustive = match
  .in<"a" | "b" | "c">()
  .match({
    a: () => 1,
    b: () => 2,
    c: () => 3
  })
  // No .default() - TypeScript verifies exhaustiveness
```

## Match Tips

1. **Use `.in<T>()`** for type safety on inputs
2. **Use `.at(key)`** for discriminated unions
3. **Always `.default()`** unless exhaustiveness is guaranteed
4. **Case record** for simple, fluent for complex
5. **Prefer `match` over `type.or()`** for runtime branching

## Error Handling

```typescript
const safeMatch = match
  .in<unknown>()
  .match({
    string: s => ({ success: true, data: s }),
    number: n => ({ success: true, data: n })
  })
  .default(err => ({ success: false, error: err }))
```
