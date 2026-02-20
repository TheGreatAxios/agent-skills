# Rule: Zod Core

## Why It Matters

Zod Core (`zod/v4/core`) provides low-level building blocks for creating custom validation libraries. Use when building schema systems on top of Zod or needing maximum control.

## Import Path

```typescript
import * as zc from "zod/v4/core"
```

## Core Types

### ZodType

Base type for all Zod schemas.

```typescript
import { ZodType } from "zod/v4/core"

// Base interface
interface ZodType<T = unknown> {
  parse(data: unknown): T
  safeParse(data: unknown): SafeParseResult<T>
  // ...
}
```

### ZodIssue

Validation error representation.

```typescript
interface ZodIssue {
  code: string
  message: string
  path: (string | number)[]
  // ...
}
```

### ZodError

Collection of validation issues.

```typescript
class ZodError extends Error {
  issues: ZodIssue[]

  format(): ZodFormattedError
  flatten(): ZodFlattenedError
}
```

## Core Functions

### createSchema

Create schema from definition.

```typescript
import { createSchema } from "zod/v4/core"

const schema = createSchema({
  type: "string",
  minLength: 5
})
```

### parse

Core parsing function.

```typescript
import { parse } from "zod/v4/core"

const result = parse(schema, data)
```

### safeParse

Non-throwing parse.

```typescript
import { safeParse } from "zod/v4/core"

const result = safeParse(schema, data)
if (result.success) {
  console.log(result.data)
} else {
  console.log(result.error)
}
```

## Schema Definition Format

### Primitive Types

```typescript
// String
const stringDef = { type: "string" }

// Number
const numberDef = { type: "number" }

// Boolean
const booleanDef = { type: "boolean" }

// Null
const nullDef = { type: "null" }
```

### String Constraints

```typescript
const constrainedString = {
  type: "string",
  minLength: 5,
  maxLength: 100,
  pattern: "^[a-z]+$",
  format: "email"
}
```

### Number Constraints

```typescript
const constrainedNumber = {
  type: "number",
  minimum: 0,
  maximum: 100,
  multipleOf: 5
}
```

### Object Type

```typescript
const objectDef = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  },
  required: ["name"]
}
```

### Array Type

```typescript
const arrayDef = {
  type: "array",
  items: { type: "string" },
  minItems: 1,
  maxItems: 10
}
```

### Union Type

```typescript
const unionDef = {
  type: "union",
  options: [
    { type: "string" },
    { type: "number" }
  ]
}
```

## Custom Schema Types

### Extend ZodType

```typescript
import { ZodType, ZodDef } from "zod/v4/core"

class CustomSchema extends ZodType<string> {
  _parse(input: unknown): ParseResult<string> {
    // Custom parsing logic
    if (typeof input === "string") {
      return { success: true, data: input }
    }
    return {
      success: false,
      error: new ZodError([{
        code: "invalid_type",
        message: "Expected string"
      }])
    }
  }
}
```

### Register Custom Type

```typescript
import { registerType } from "zod/v4/core"

registerType("custom", (def) => new CustomSchema(def))
```

## Utilities

### Type Coercion

```typescript
import { coerce } from "zod/v4/core"

const coercedNumber = coerce("number", data)
```

### Error Formatting

```typescript
import { formatError, flattenError } from "zod/v4/core"

const formatted = formatError(zodError)
const flattened = flattenError(zodError)
```

### Path Utilities

```typescript
import { formatPath, mergePaths } from "zod/v4/core"

const path = formatPath(["user", "address", "city"])
// "user.address.city"
```

## Using Core with Regular Zod

```typescript
import { z } from "zod"
import * as zc from "zod/v4/core"

// Get core representation
const schema = z.object({ name: z.string() })
const coreDef = schema._def

// Use core parsing
const result = zc.safeParse(schema, data)
```

## Creating Schema Factories

```typescript
import { ZodType, ZodError } from "zod/v4/core"

function createValidatedString(
  validator: (s: string) => boolean,
  message: string
): ZodType<string> {
  return {
    parse(input: unknown): string {
      if (typeof input !== "string") {
        throw new ZodError([{
          code: "invalid_type",
          message: "Expected string"
        }])
      }
      if (!validator(input)) {
        throw new ZodError([{
          code: "custom",
          message
        }])
      }
      return input
    },
    safeParse(input: unknown) {
      try {
        return { success: true, data: this.parse(input) }
      } catch (error) {
        return { success: false, error: error as ZodError }
      }
    }
  }
}
```

## When to Use Core

| Use Case | Use Core? |
|----------|-----------|
| Normal validation | No - use `zod` |
| Custom schema types | Yes |
| Schema generation | Yes |
| Building validation library | Yes |
| Performance optimization | Maybe |
| Debugging schema internals | Yes |

## Tips

1. **Use sparingly**: Regular Zod covers most needs
2. **For library authors**: Core is for building on top of Zod
3. **Schema definition**: JSON Schema-like format
4. **Custom types**: Extend ZodType for new behavior
5. **Type safety**: Core maintains full TypeScript support
