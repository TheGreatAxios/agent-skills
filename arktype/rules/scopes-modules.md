# Rule: scopes-modules

## Why It Matters

Scopes organize reusable type definitions with cross-references. Modules export public APIs with private/internal type support. This is essential for building maintainable type libraries.

## Scopes

### Basic Scope

```typescript
import { scope } from "arktype"

const myScope = scope({
  Id: "string",
  User: { id: "Id", name: "string" },
  UserList: "User[]"
})

const types = myScope.export()

types.UserList([{ id: "1", name: "Alice" }])
```

### Private Aliases (# prefix)

```typescript
const shapeScope = scope({
  // Not included in exports
  "#BaseProps": {
    perimeter: "number",
    area: "number"
  },

  // References don't need "#" prefix
  Ellipse: {
    "...": "BaseProps",
    radii: ["number", "number"]
  }
})

const shapeModule = shapeScope.export()
// shapeModule.BaseProps // undefined
```

### Recursive Types

```typescript
const types = scope({
  Node: {
    value: "string",
    "left?": "Node",
    "right?": "Node"
  }
}).export()

type Node = typeof types.Node.infer
// { value: string, left?: Node, right?: Node }
```

### Generic Definitions in Scope

```typescript
const types = scope({
  // Type parameter list before definition
  "box<t, u>": {
    first: "t",
    second: "u"
  },
  // Reference generic
  myBox: "box<string, number>"
}).export()

const result = types.myBox({ first: "hello", second: 42 })
```

### Constrained Generics in Scope

```typescript
const types = scope({
  "nonEmpty<arr extends unknown[]>": "arr > 0",
  strings: "nonEmpty<string[]>"
}).export()
```

## Modules

### type.module (Inline Export)

```typescript
const types = type.module({
  Id: "string",
  User: { id: "Id", name: "string" },

  // Reference other definitions
  Admin: {
    "...": "User",
    isAdmin: "true"
  },

  // Or reference entire module
  Admin2: "User & { isAdmin: true }"
})
```

### scope + .export()

```typescript
const userScope = scope({
  Id: "string",
  User: { id: "Id", name: "string" }
})

const types = userScope.export()

types.User({ id: "1", name: "Alice" })
```

### Submodules

```typescript
const userModule = type.module({
  // Root type
  root: { name: "string" },

  // Subtype extending root
  Admin: {
    "...": "root",
    isAdmin: "true"
  }
})

const types = type.module({
  // User as a module
  User: userModule,

  // Access subaliases via dot notation
  SuperAdmin: "User.Admin & { powerLevel: 9000 }"
})
```

### Nested Submodules

```typescript
const subScope = type.module({ alias: "number" })

const rootScope = scope({
  a: "string",
  // Include submodule (can reference sub.alias)
  sub: subScope
})

const nestedScope = scope({
  // Reference rootScope's submodule
  newSub: rootScope.export().sub
})
```

## Scope Methods

### .export()

Convert scope to usable module:

```typescript
const myScope = scope({ User: { name: "string" } })
const module = myScope.export()
// module.User can now be used
```

### .import()

Import from another scope as private:

```typescript
const utilityScope = scope({
  "withId<o extends object>": {
    "...": "o",
    id: "string"
  }
})

const userModule = type.module({
  // withId is available internally but not exported
  ...utilityScope.import(),

  Payload: { name: "string" },
  db: "withId<Payload>"  // can reference it
})
```

### .type()

Create new type within scope:

```typescript
const coolScope = scope({
  Id: "string",
  User: { id: "Id" }
})

// Uses same scope references
const Group = coolScope.type({
  name: "string",
  members: "User[]"
})
```

## Advanced Patterns

### Thunk Definitions (Lazy eval)

```typescript
const $ = scope({
  Id: "string",

  // Function returning a type
  expandUser: () =>
    $.type({
      name: "string",
      id: "Id"
    }).or("Id")
    .array()
    .atLeastLength(2)
})
```

### Type-level Modules

```typescript
type UserModule = {
  User: { id: "string", name: "string" },
  Admin: { "...": "User", isAdmin: "true" }
}

const types = type.module(UserModule)
```

### External Module Pattern

```typescript
// base.ts
export const BaseTypes = type.module({
  Id: "string",
  CreatedAt: "Date"
})

// user.ts
import { BaseTypes } from "./base"

export const UserTypes = type.module({
  ...BaseTypes,
  User: { id: "Id", createdAt: "CreatedAt" }
})
```

## Scope Best Practices

1. **Private helpers** with `#` prefix for internal types
2. **Related types** go in same scope
3. **Export once** - use `.export()` to finalize
4. **Thunk for forward refs** - use `() => type(...)` for self-references
5. **Submodules** for hierarchical organization

## Scope Tips

| Pattern | Use Case |
|--------|-----------|
| `#Prefix` | Internal-only types |
| `scope(...)` | Multi-file, cross-references |
| `type.module(...)` | Single-file, public API |
| `...other.import()` | Private import from scope |
| `"<t>"` prefix | Generic definition |

## Module Comparison

| Feature | `scope()` | `type.module()` |
|---------|----------|----------------|
| Private types | Yes (`#`) | No |
| Cross-references | Full | Full |
| Export needed | Yes (`.export()`) | No (auto) |
| Generic defs | Yes | Yes |
| Use case | Libraries | Apps/simple |

## Related Rules

- `type-definition-syntax` - Type definitions within scopes
- `generics` - Generic type parameters
