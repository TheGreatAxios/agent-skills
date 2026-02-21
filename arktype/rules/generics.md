# Rule: generics

## Why It Matters

Generics enable reusable type definitions. ArkType supports type parameters, constraints, and both scope-level and standalone generics.

## Basic Generics

### Generic Definition

```typescript
import { type } from "arktype"

const boxOf = type("<t>", {
  contents: "t"
})

const stringBox = boxOf({ type: "string" })
const numberBox = boxOf({ type: "number" })

type StringBox = typeof stringBox.infer
// { contents: string }
```

### Multiple Type Parameters

```typescript
const pair = type("<t, u>", {
  first: "t",
  second: "u"
})

const stringNumberPair = pair({
  first: { type: "string" },
  second: { type: "number" }
})
```

### Generic with Union

```typescript
const result = type("<t, e>", {
  success: "true",
  data: "t"
}).or({
  success: "false",
  error: "e"
})
```

## Constrained Generics

### Extends Constraint

```typescript
const nonEmpty = type("<arr extends unknown[]>", "arr > 0")

const strings = nonEmpty("string[]")
// Non-empty string array
```

### Multiple Constraints

```typescript
const numericArray = type("<t extends number>", {
  values: "t[]",
  sum: type.number
})

const ints = numericArray({ type: "number.integer" })
```

### Constraints in Scope

```typescript
const types = scope({
  "bounded<n extends number>": "0 <= n <= 100",
  score: "bounded<number.integer>"
}).export()
```

## Scope Generics

### Define Generic in Scope

```typescript
const types = scope({
  "box<t>": {
    value: "t"
  },

  // Reference generic
  stringBox: "box<string>",
  numberBox: "box<number>"
}).export()
```

### Constrained Scope Generic

```typescript
const types = scope({
  "arrayOf<t, min extends number = 0>": {
    items: "t[]",
    minLength: "min"
  },

  nonEmptyStrings: "arrayOf<string, 1>"
}).export()
```

### Generic Helpers

```typescript
const utilityScope = scope({
  "withId<o extends object>": {
    "...": "o",
    id: "string"
  }
})

const userModule = type.module({
  ...utilityScope.import(),

  User: { name: "string" },
  UserWithId: "withId<User>"
})
```

## Advanced Generic Patterns

### Generic Union

```typescript
const oneOf = type("<t>", "t | t[]")

const Result = oneOf({ type: "string" })
// string | string[]
```

### Recursive Generic

```typescript
const tree = type("<t>", {
  value: "t",
  "left?": "tree<t>",
  "right?": "tree<t>"
})
```

### Generic Morph

```typescript
const parse = type("<t>", ["string.json.parse", "=>", (s): t => JSON.parse(s)])

const User = parse({ type: { name: "string", age: "number" } })
```

## Generic Inference

### From Literal

```typescript
const Box = type("<t>", { value: "t" })

// Inferred as { value: "hello" }
const result = Box({ type: "'hello'" })
```

### From Type Reference

```typescript
const User = type({ name: "string" })
const UserBox = type("<t>", { value: "t" })

// Type is { value: User }
const boxed = UserBox({ type: User })
```

## Built-in Generic Keywords

ArkType provides TypeScript-like generics:

```typescript
import { type } from "arktype"

// Exclude
const WithoutFalse = type.keywords.Exclude("boolean", "false")

// Pick (at type-level)
// Use .pick() method instead
const NameOnly = User.pick("name", "email")
```

### External Generic Integration

```typescript
const createBox = <const def>(
  of: type.validate<def>
): type.instantiate<{ of: def }> =>
  type.raw({ box: of }) as never

// Type<{ box: string }>
const BoxType = createBox("string")
```

## Generic Tips

1. **Single letter** for type params (`t`, `u`, `T`)
2. **Descriptive** for constraints (`min extends number`)
3. **Defaults** with `=`: `<t extends string = "">`
4. **Scope generics** for reusable libraries
5. **Constrain** with `extends` for type safety

## Generic Syntax Summary

| Pattern | Meaning |
|---------|---------|
| `"<t>"` | Single type parameter |
| `"<t, u>"` | Multiple parameters |
| `"<t extends Base>"` | Constrained parameter |
| `"<t = Default>"` | Default type |
| `scope({ "box<t>": ... })` | Generic in scope |

## Common Generic Use Cases

```typescript
// API response wrapper
const ApiResponse = type("<t>", {
  data: "t",
  status: "number"
})

// Paginated
const Paginated = type("<t>", {
  items: "t[]",
  total: "number",
  page: "number"
})

// Result type
const Result = type("<t, e>", {
  ok: "true",
  value: "t"
}).or({
  ok: "false",
  error: "e"
})
```
