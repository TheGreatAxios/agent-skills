# Rule: BigInt Validation

## Why It Matters

BigInt handles integers larger than Number.MAX_SAFE_INTEGER (2^53 - 1). Use BigInt validation for large numeric IDs, precise calculations, or when working with blockchain/smart contract data.

## Basic Usage

```typescript
import { z } from "zod"

// Basic bigint
const LargeNumber = z.bigint()

// With type inference
type LargeNumber = z.infer<typeof LargeNumber> // bigint
```

## Range Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum value | `z.bigint().min(0n)` |
| `.max(n)` | Maximum value | `z.bigint().max(1000000n)` |
| `.gt(n)` | Greater than | `z.bigint().gt(0n)` |
| `.lt(n)` | Less than | `z.bigint().lt(100n)` |
| `.gte(n)` | Greater than or equal | `z.bigint().gte(0n)` |
| `.lte(n)` | Less than or equal | `z.bigint().lte(100n)` |

```typescript
// Non-negative bigint
const NonNegative = z.bigint().min(0n)

// Positive bigint
const Positive = z.bigint().gt(0n)

// Bounded range
const Bounded = z.bigint()
  .min(0n)
  .max(1000000000000000000n)

// Custom error messages
const CustomMessage = z.bigint()
  .min(0n, "Value cannot be negative")
  .max(1000n, { message: "Maximum is 1000" })
```

## Common Patterns

### Large IDs

```typescript
// Snowflake ID (Twitter/Discord style)
const SnowflakeId = z.bigint().positive()

// Blockchain address as numeric
const ChainId = z.bigint().positive()

// Database bigint ID
const BigId = z.bigint().positive()
```

### Token Amounts

```typescript
// Wei (Ethereum smallest unit)
const Wei = z.bigint().nonnegative()

// Token amount with bounds
const TokenAmount = z.bigint()
  .min(0n)
  .max(1000000000000000000000000000n)
```

### Precise Calculations

```typescript
// Financial calculation with no precision loss
const PreciseCents = z.bigint()
  .min(0n)

// Timestamp in nanoseconds
const NanosecondTimestamp = z.bigint().positive()
```

## With Coercion

```typescript
// Coerce to bigint
const CoercedBigint = z.coerce.bigint()

z.coerce.bigint().parse("123") // 123n
z.coerce.bigint().parse(123) // 123n
z.coerce.bigint().parse(123n) // 123n

// Coerced with validation
const CoercedPositive = z.coerce.bigint().positive()
```

## Transform Between Types

```typescript
// BigInt to Number (with range check)
const SafeToNumber = z.bigint()
  .max(BigInt(Number.MAX_SAFE_INTEGER))
  .transform(n => Number(n))

// BigInt to String
const BigintToString = z.bigint()
  .transform(n => n.toString())

// String to BigInt
const StringToBigint = z.string()
  .transform(s => BigInt(s))
```

## Edge Cases

```typescript
// Valid inputs
z.bigint().parse(123n) // ✓
z.bigint().parse(BigInt(123)) // ✓

// Invalid inputs
z.bigint().parse(123) // ✗ throws (must be bigint)
z.bigint().parse("123") // ✗ throws
z.bigint().parse(null) // ✗ throws

// Very large numbers
z.bigint().parse(999999999999999999999999999999n) // ✓ passes
```

## Type Inference

```typescript
const schema = z.bigint()
type Inferred = z.infer<typeof schema> // bigint

const optional = z.bigint().optional()
type Optional = z.infer<typeof optional> // bigint | undefined
```

## Comparison with Number

| Feature | z.number() | z.bigint() |
|---------|------------|------------|
| Max safe value | 2^53 - 1 | Unlimited |
| Decimal support | Yes | No |
| Infinity | Yes | No |
| NaN | Yes | No |
| JSON serialization | Native | String conversion needed |

## Tips

1. **Use BigInt for large IDs**: Prevents precision loss
2. **JSON serialization**: BigInt doesn't serialize natively, use `.transform()`
3. **Coercion**: Use `z.coerce.bigint()` for string inputs
4. **Performance**: BigInt is slower than Number for small values
5. **Type safety**: TypeScript `bigint` type, not `number`
