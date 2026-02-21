# Rule: type-definition-syntax

## Why It Matters

ArkType offers multiple syntax options for defining types. Choosing the right syntax improves readability and maintainability. String syntax is most concise, fluent API best for chaining complex constraints.

## Syntax Comparison

### String Syntax (Recommended for most cases)

**Pros**: Most concise, readable, familiar to TypeScript users
**Cons**: Limited to predefined operators

```typescript
const User = type({
  name: "string",
  age: "number.integer >= 0",
  email: "string.email",
  "role?": "'admin' | 'user'",
  tags: "string[]",
  "metadata?": "Record<string, unknown>"
})
```

**String Operators**
| Operator | Meaning | Example |
|----------|---------|---------|
| `\|` | Union | `"string \| number"` |
| `&` | Intersection | `"string & /@ark\\.io$/"` |
| `>` / `>=` | Greater than | `"number > 0"` |
| `<` / `<=` | Less than | `"number <= 100"` |
| `%` | Divisible by | `"number % 2"` |
| `?` suffix | Optional | `"key?: type"` |
| `=` suffix | Default | `"key?: type = value"` |
| `[]` suffix | Array | `"string[]"` |
| `...` prefix | Variadic | `"...number[]"` |

### Fluent API (Best for chaining)

**Pros**: IDE autocomplete, complex constraints, readable chains
**Cons**: More verbose

```typescript
const Password = type.string
  .atLeastLength(8)
  .atMostLength(100)
  .describe("a secure password")

const EmailList = type.string.email
  .array()
  .atLeastLength(1)
  .atMostLength(10)
```

**Fluent Methods**
| Method | Use Case |
|--------|-----------|
| `.atLeast(n)` / `.moreThan(n)` | Min length/value |
| `.atMost(n)` / `.lessThan(n)` | Max length/value |
| `.divisibleBy(n)` | Number divisibility |
| `.email()` / `.uuid()` / `.semver()` | String formats |
| `.array()` | Array of type |
| `.optional()` / `.default(v)` | Optionality |
| `.brand(name)` | Type branding |
| `.narrow(fn)` | Type predicate |
| `.configure(opts)` | Custom metadata |

### Tuple Syntax (Nested structures)

**Pros**: Clear for arrays/tuples with mixed types
**Cons**: Verbose for simple objects

```typescript
const Response = type([
  "string",  // status
  {          // data object
    id: "string",
    name: "string"
  },
  "...",    // variadic
  type.string.array()  // zero+ strings
])
```

### Args/Operator Syntax

**Pros**: Explicit operators, function-like
**Cons**: Unfamiliar syntax

```typescript
const Union = type("string", "|", "number")
const Intersection = type("string", "&", /pattern/)
```

## Common Patterns

### Object Properties

```typescript
// Required
{ key: "string" }

// Optional (exactOptionalPropertyTypes: true)
{ "key?": "string" }

// Optional with default
{ "key?": "string = 'default'" }

// Required union with undefined
{ key: "string | undefined" }
```

### Array Constraints

```typescript
// Non-empty array
"string[] > 0"

// Bounded length
"2 <= string[] <= 10"

// Tuple
["string", "number", "boolean?"]

// Variadic tuple
["string", "...", "number[]"]
```

### String Constraints

```typescript
// Length
"string >= 8"        // at least 8 chars
"string < 100"        // less than 100

// Format
"string.email"
"string.uuid.v4"
"string.date.iso"
"string.json.parse"

// Pattern
"/^ark.*$/"
```

### Number Constraints

```typescript
// Range
"number > 0"              // positive
"-50 < number <= 100"      // bounded

// Properties
"number.integer"           // integer only
"number % 2"              // even
"number.divisibleBy(5)"     // fluent version

// Special formats
"number.epoch"             // unix timestamp
"number.port"              // 1-65535
```

### Date Constraints

```typescript
// Bounds
"Date > 0"                         // after epoch
"Date < d'2025-01-01'"               // before date
"d'2020-01-01' <= Date <= d'2025-01-01'"

// Formats
"string.date"                        // date object to string
"string.date.iso"                     // ISO format
"string.date.parse"                   // parse to Date
```

## Type Definition Tips

1. **Use string syntax** for 90% of cases - most readable
2. **Use fluent API** for complex chaining (e.g., password with multiple constraints)
3. **Use tuple syntax** for mixed-type arrays
4. **Prefer keywords** over raw types (`"string.email"` over regex)
5. **Leverage autocomplete** - fluent API shows all options

## Error Messages

Customize via `.describe()` or `.configure()`:

```typescript
const Age = type("number.integer >= 0").configure({
  description: "a non-negative integer",
  problem: ctx => `${ctx.actual} is negative!`
})
```
