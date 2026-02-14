# Rule: attest-testing

## Why It Matters

Attest provides type-safe testing with snapshot capabilities for ArkType types. It combines runtime assertions with compile-time type checking and includes benchmarking.

## Setup

### Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globalSetup: ["./setupVitest.ts"]
  }
})
```

```typescript
// setupVitest.ts
import { setup } from "@ark/attest"

export default () => setup({})
```

### Mocha

```typescript
// .mocharc.js or package.json
export default {
  require: "./setupMocha.ts"
}
```

```typescript
// setupMocha.ts
import { setup, teardown } from "@ark/attest"

export const mochaGlobalSetup = () => setup({})
export const mochaGlobalTeardown = teardown
```

### Config Options

```typescript
setup({
  skipTypes: false,           // Skip type assertions
  skipInlineInstantiations: false,
  updateSnapshots: false,       // Update snapshots
  benchPercentThreshold: 20,   // Perf threshold
  benchErrorOnThresholdExceeded: true,
  tsVersions: "typescript"      // or "*" for all
})
```

## Type Assertions

### Basic Type Assert

```typescript
import { attest } from "@ark/attest"
import { type } from "arktype"

const Even = type("number % 2")

it("type inference", () => {
  // Assert Even.infer is exactly number
  attest<number>(even.infer)
})
```

### Type String Snapshot

```typescript
it("type string snapshot", () => {
  const Even = type("number % 2")

  attest(even.infer).type.toString.snap("number")

  // Or with full type representation
  attest(even.infer).type.toString.snap("Type<number.divisibleBy<2>>")
})
```

### Value Snapshot

```typescript
it("value snapshot", () => {
  const config = {
    intersection: [{ domain: "number" }, { divisor: 2 }]
  }

  attest(even.json).snap({
    intersection: [{ domain: "number" }, { divisor: 2 }]
  })
})
```

## Completions Testing

### String Completions

```typescript
it("completions snapshot", () => {
  // @ts-expect-error
  attest(() => type({ a: "a", b: "b" })).completions({
    a: ["any", "alpha", "alphanumeric"],
    b: ["bigint", "boolean"]
  })
})
```

### Key Completions

```typescript
it("key completions", () => {
  const Legends = { faker?: "🐐"; [others: string]: unknown }

  // prettier-ignore to preserve quotes
  attest({ "f": "🐐" } as Legends).completions({
    "f": ["faker"]
  })
})
```

## Error Testing

### Type Errors

```typescript
it("type errors", () => {
  // @ts-expect-error
  attest(() => type("number%0")).throwsAndHasTypeError(
    "% operator must be followed by a non-zero integer literal (was 0)"
  )
})
```

### Runtime Errors

```typescript
it("runtime errors", () => {
  // @ts-expect-error
  attest(() => type({ "[object]": "string" })).type.errors(
    "Indexed key definition 'object' must be a string, number or symbol"
  )
})
```

### Combined Errors

```typescript
it("both error types", () => {
  // @ts-expect-error
  attest(() => type("number%0"))
    .throwsAndHasTypeError("type error message")
    .type.errors("runtime error message")
})
```

## JSDoc Testing

```typescript
it("jsdoc snapshot", () => {
  const T = type({
    /** FOO */
    foo: "string"
  })

  const out = T.assert({ foo: "bar" })

  attest(out.foo).jsdoc.snap("FOO")
})
```

## Conditional Testing

### Runtime + Type Combined

```typescript
it("conditional type assertions", () => {
  const arrayOf = type("<t>", "t[]")
  const numericArray = arrayOf("number | bigint")

  // Combine runtime logic with type assertions
  if (getTsVersionUnderTest().startsWith("5")) {
    // Only runs for TypeScript 5+
    attest<(number | bigint)[]>(numericArray.infer)
  }
})
```

## Benchmarking

### Basic Bench

```typescript
import { bench } from "@ark/attest"

bench("single-quoted", () => {
  const _ = type("'nineteen characters'")
}).types([610, "instantiations"])
```

### With Baseline

```typescript
// Baseline to avoid warmup noise
type("boolean")

bench("single-quoted", () => {
  const _ = type("'nineteen characters'")
}).types([610, "instantiations"])
```

### Runtime + Type

```typescript
bench(
  "bench runtime and type",
  () => {
    return {} as makeComplexType<"antidisestablishmentarianism">
  },
  fakeCallOptions
)
  .mean([2, "ms"])      // Runtime
  .types([337, "instantiations"])  // Type cost
```

### Threshold Options

```typescript
// CLI flags
tsx ./bench.ts --benchErrorOnThresholdExceeded --benchPercentThreshold 10
```

## Instantiations Testing

```typescript
it("integrated type performance", () => {
  const User = type({
    kind: "'admin'",
    "powers?": "string[]"
  }).or({
    kind: "'superadmin'",
    "superpowers?": "string[]"
  }).or({
    kind: "'pleb'"
  })

  attest.instantiations([7574, "instantiations"])
})
```

## Custom Assertions

```typescript
import { getTypeAssertionsAtPosition, caller } from "@ark/attest"

const myAssert = <expectedType>(actualValue: expectedType) => {
  const position = caller()
  const types = getTypeAssertionsAtPosition(position)

  const relationship = types[0].args[0].relationships.typeArgs[0]
  if (relationship === undefined) {
    throw new Error("myAssert requires a type arg")
  }
  if (relationship !== "equality") {
    throw new Error(`Expected ${types.typeArgs[0].type}, got ${types.args[0].type}`)
  }
}
```

## Setup with Custom Aliases

```typescript
setup({
  // Collect type data from custom functions
  attestAliases: ["myAssert"]
})
```

## NPM Scripts

```json
{
  "scripts": {
    "test": "ATTEST_skipTypes=1 vitest run",
    "testWithTypes": "vitest run",
    "test:bench": "vitest run --bench",
    "test:update": "vitest run --update"
  }
}
```

## Prettier Config for Type Strings

```json
{
  "semi": false,
  "printWidth": 60,
  "trailingComma": "none",
  "parser": "typescript"
}
```

## Attest Tips

1. **Run with types** in CI for full coverage
2. **Skip types locally** for faster iteration
3. **Snapshots** for regression testing
4. **Benchmark** complex types for performance
5. **Custom assertions** for domain-specific needs

## Attest vs Standard Testing

| Feature | Attest | Standard |
|---------|--------|----------|
| Type checking | ✓ | ✗ |
| Snapshotting | ✓ | Limited |
| Benchmarking | ✓ | Manual |
| Completions | ✓ | ✗ |
| Type errors | ✓ | Via ts-expect-error |

## Common Patterns

### Type + Value Tests

```typescript
describe("User type", () => {
  it("infers correctly", () => {
    attest<{ name: string; age?: number }>(User.infer)
  })

  it("validates data", () => {
    const result = User({ name: "Alice", age: 30 })
    attest(result).snap({ name: "Alice", age: 30 })
  })
})
```

### Error Cases

```typescript
it("rejects invalid data", () => {
  const result = User({ name: "Bob", age: -5 })

  if (result instanceof type.errors) {
    attest(result.summary).snap("age must be at least 0 (was -5)")
  } else {
    throw new Error("Should have errored")
  }
})
```

## Related Rules

- `type-definition-syntax` - Type definitions for testing
- `validation-and-errors` - Error handling in tests
