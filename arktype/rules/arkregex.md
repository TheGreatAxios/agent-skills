# Rule: arkregex

## Why It Matters

ArkRegex is a drop-in replacement for `new RegExp()` with full type safety. It infers capture group types, provides `.test()` and `.exec()` with types, and supports 100% of native RegExp features with zero runtime overhead.

## Installation

```bash
pnpm install arkregex
# or
npm install arkregex
```

Requires TypeScript 5.9+

## Basic Usage

### Simple Pattern

```typescript
import { regex } from "arkregex"

const ok = regex("^ok$", "i")
// Regex<"ok" | "oK" | "Ok" | "OK", { flags: "i" }>

ok.test("OK")     // true
ok.test("not ok") // false
```

### With Capture Groups

```typescript
const semver = regex("^(\\d*)\\.(\\d*)\\.(\\d*)$")
// Regex<`${bigint}.${bigint}.${bigint}`, { captures: [bigint, bigint, bigint] }

const match = semver.exec("1.2.3")
if (match) {
  console.log(match.captures)  // ["1", "2", "3"]
  console.log(match.index)     // 0
  console.log(match.input)     // "1.2.3"
}
```

### Named Capture Groups

```typescript
const email = regex("^(?<name>\\w+)@(?<domain>\\w+\\.\\w+)$")
// Regex<`${string}@${string}.${string}`, { names: { name: string; domain: `${string}.${string}`; } }

const match = email.exec("user@example.com")
if (match) {
  console.log(match.groups.name)    // "user"
  console.log(match.groups.domain)  // "example.com"
}
```

## Type Inference

### Inferred Capture Types

ArkRegex statically infers types from your pattern:

| Pattern | Inferred Type |
|---------|--------------|
| `\\d+` | `string` |
| `\\d*` | `bigint` |
| `[a-z]` | `"a" | "b" | ... | "z"` |
| `[a-z0-9]` | `"a" | ... | "z" | "0" | ... | "9"` |
| `(...)` | `string` |

### Positional Captures

```typescript
const date = regex("^(\\d{4})-(\\d{2})-(\\d{2})$")
// Regex<`${string}-${string}-${string}`, { captures: [string, string, string] }

const match = date.exec("2025-02-13")
if (match) {
  const [full, year, month, day] = match
  // full: string, year: string, month: string, day: string
}
```

### Named Captures

```typescript
const url = regex(
  "^(?<protocol>https?):\\/\\/(?<domain>[^/]+)(?<path>\\/[^?]*)?"
)
// Regex with typed groups: { protocol: string | undefined, domain: string, path: string | undefined }
```

## Regex Methods

### .test()

```typescript
const pattern = regex("^hello")

if (pattern.test("hello world")) {
  // TypeScript knows this branch runs
}
```

### .exec()

```typescript
const pattern = regex("(?<word>\\w+)")

const match = pattern.exec("hello")
if (match) {
  // match.captures - tuple of positional captures
  // match.groups - object of named captures
  // match.index - match start index
  // match.input - full input string
  // match[0] - full match
  // match[1], match[2], etc. - positional captures (aliased)
}
```

### .match() (all matches)

```typescript
const pattern = regex("\\d+")

const matches = pattern.match("1-2-3")
// Array of match objects or null
```

## Flags

```typescript
// Single flag
const caseIntensitive = regex("hello", "i")

// Multiple flags
const global = regex("hello", "gi")

// Flags are part of the type
// Regex<...> includes { flags: "gi" }
```

## Complex Patterns

### regex.as() for Manual Typing

When TypeScript can't infer:

```typescript
import { regex } from "arkregex"

const complexPattern = regex.as<
  `pattern-${string}`,
  { captures: [string] }
>("very-long-complex-expression-here")
```

### Why manual typing?

- Very long patterns
- Deeply nested patterns
- Complex alternations
- When you see "Type is excessively deep..."

## Type Safety Features

### Invalid Group Reference

```typescript
// @ts-expect-error - group "foo" doesn't exist
const bad = regex("^(?<bar>\\w+)$")
if (bad.exec("test")) {
  // TypeScript error: Property 'foo' does not exist
  console.log(bad.groups.foo)
}
```

### Capture Type Mismatch

```typescript
const digits = regex("(\\d+)")

const match = digits.exec("123")
if (match) {
  // match.captures[0] is bigint (from \d+), not string
  const num: bigint = match.captures[0]
}
```

## Zero Runtime Overhead

ArkRegex has no runtime cost:

- Types are erased at compile time
- Uses native `RegExp` at runtime
- Bundle size impact: ~0 bytes

## Comparison Table

| Feature | ArkRegex | RegExp |
|---------|---------|---------|
| Type inference | ✓ | ✗ |
| Capture typing | ✓ | ✗ |
| Named groups | ✓ | ✓ |
| Flag types | ✓ | ✗ |
| Runtime perf | Same | Same |
| Bundle size | ~0 | ~0 |

## Syntax Highlighting

Install the [ArkType VS Code Extension](https://marketplace.visualstudio.com/items?itemName=arktypeio.arktype) for regex syntax highlighting:

```json
{
  "recommendations": ["arktypeio.arktype"]
}
```

## Common Patterns

### Email

```typescript
const emailPattern = regex(
  "^(?<local>[\\w.+-]+)@(?<domain>[\\w-]+\\.[a-z]{2,})$"
)
```

### URL

```typescript
const urlPattern = regex(
  "^(?<protocol>https?):\\/\\/(?<domain>[^/]+)(?<path>\\/[^?#]*)?(?<query>[^#]*)?(?<hash>.*)?$"
)
```

### Semver

```typescript
const semverPattern = regex("^(?<major>0|[1-9]\\d*)\\.(?<minor>0|[1-9]\\d*)\\.(?<patch>0|[1-9]\\d*)$")
```

### UUID v4

```typescript
const uuidPattern = regex(
  "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
```

## Limitations

### Not Precisely Inferred

Character ranges like `[a-z]` are inferred as `string`, not literal union:

```typescript
const range = regex("[a-z]+")
// Inferred as string, not "a" | "b" | ... | "z"
```

This prevents combinatorial explosion while maintaining safety.

### Type Depth Limits

Very complex patterns may hit TypeScript's type depth limit. Use `regex.as()` for these cases.

## Testing

### With Attest

```typescript
import { attest, setup } from "@ark/attest"
import { regex } from "arkregex"

setup()

it("regex types", () => {
  const pattern = regex("^ok$")
  attest<"ok">(pattern.infer)

  const match = pattern.exec("ok")
  if (match) {
    attest<"ok">(match[0])
  }
})
```

## Tips

1. **Use for all regex** - no reason not to have type safety
2. **Named groups** when possible - better DX with `.groups.name`
3. **`regex.as()`** when inference fails
4. **Install extension** for syntax highlighting
5. **TS 5.9+** required for best experience

## Related

- `type-definition-syntax` - ArkType type syntax
- `integrations` - Other ArkType integrations
