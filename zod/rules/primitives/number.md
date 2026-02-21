# Rule: Number Validation

## Why It Matters

Number validation ensures numeric data falls within expected ranges and meets precision requirements. Proper validation prevents overflow errors, invalid calculations, and security issues.

## Basic Usage

```typescript
import { z } from "zod"

// Basic number
const Age = z.number()

// With type inference
type Age = z.infer<typeof Age> // number
```

## Range Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum value (inclusive) | `z.number().min(0)` |
| `.max(n)` | Maximum value (inclusive) | `z.number().max(100)` |
| `.gt(n)` | Greater than (exclusive) | `z.number().gt(0)` |
| `.lt(n)` | Less than (exclusive) | `z.number().lt(100)` |
| `.gte(n)` | Greater than or equal | `z.number().gte(0)` |
| `.lte(n)` | Less than or equal | `z.number().lte(100)` |

```typescript
// Age validation
const Age = z.number()
  .min(0, "Age cannot be negative")
  .max(150, "Age seems unrealistic")

// Percentage
const Percentage = z.number()
  .min(0)
  .max(100)

// Positive number
const PositiveAmount = z.number()
  .gt(0, "Amount must be positive")
```

## Integer Validation

| Method | Purpose | Example |
|--------|---------|---------|
| `.int()` | Must be integer | `z.number().int()` |
| `.safe()` | Safe integer range | `z.number().safe()` |

```typescript
// Integer only
const Quantity = z.number().int("Quantity must be a whole number")

// Safe integer (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER)
const SafeNumber = z.number()
  .int()
  .safe()

// Port number
const Port = z.number()
  .int()
  .min(1)
  .max(65535)
```

## Sign Validation

| Method | Meaning | Range |
|--------|---------|-------|
| `.positive()` | > 0 | (0, ∞) |
| `.negative()` | < 0 | (-∞, 0) |
| `.nonnegative()` | >= 0 | [0, ∞) |
| `.nonpositive()` | <= 0 | (-∞, 0] |

```typescript
// Must be positive
const Price = z.number().positive("Price must be positive")

// Must be negative
const Loss = z.number().negative("Loss must be negative")

// Zero or positive
const Balance = z.number().nonnegative()

// Zero or negative
const Debt = z.number().nonpositive()
```

## Divisibility

| Method | Purpose | Example |
|--------|---------|---------|
| `.multipleOf(n)` | Divisible by n | `z.number().multipleOf(5)` |
| `.step(n)` | Step increment | `z.number().step(0.01)` |

```typescript
// Even numbers
const EvenNumber = z.number().multipleOf(2)

// Currency (cents to dollars)
const Cents = z.number().multipleOf(0.01)

// Step values (for sliders, etc.)
const SliderValue = z.number().step(5)

// Decimal precision
const Currency = z.number()
  .min(0)
  .step(0.01)
```

## Finite Validation

| Method | Purpose | Example |
|--------|---------|---------|
| `.finite()` | Not Infinity | `z.number().finite()` |

```typescript
// Reject Infinity and -Infinity
const FiniteNumber = z.number().finite()

// These pass:
z.number().finite().parse(123)
z.number().finite().parse(-123)
z.number().finite().parse(0)
z.number().finite().parse(3.14)

// These fail:
z.number().finite().parse(Infinity)
z.number().finite().parse(-Infinity)
// Note: NaN fails number validation by default
```

## Custom Error Messages

```typescript
const Age = z.number({
  required_error: "Age is required",
  invalid_type_error: "Age must be a number"
})

// Per-constraint messages
const Price = z.number()
  .positive({ message: "Price must be positive" })
  .max(1000000, { message: "Price exceeds maximum" })

// Message function (v4)
const DynamicMessage = z.number()
  .min(0, (ctx) => `Value ${ctx.value} is negative`)
```

## Common Patterns

### ID/Index

```typescript
// Array index
const Index = z.number().int().nonnegative()

// Database ID
const Id = z.number().int().positive()

// Page number
const Page = z.number().int().positive().default(1)
```

### Currency

```typescript
// Price in dollars
const Price = z.number()
  .nonnegative()
  .step(0.01)

// Price with bounds
const BoundedPrice = z.number()
  .min(0.01, "Minimum price is $0.01")
  .max(999999.99, "Maximum price exceeded")
  .step(0.01)
```

### Percentage

```typescript
const Percentage = z.number()
  .min(0)
  .max(100)

// Or as decimal
const DecimalPercent = z.number()
  .min(0)
  .max(1)
```

### Temperature

```typescript
// Celsius (water's range)
const Celsius = z.number()
  .gte(-273.15, "Below absolute zero")

// Fahrenheit
const Fahrenheit = z.number()
  .gte(-459.67, "Below absolute zero")
```

### Rating/Score

```typescript
// 5-star rating
const Rating = z.number()
  .int()
  .min(1)
  .max(5)

// 0-10 score
const Score = z.number()
  .int()
  .min(0)
  .max(10)
```

## Edge Cases

```typescript
// NaN fails number validation
z.number().parse(NaN) // ✗ throws

// Infinity passes unless .finite()
z.number().parse(Infinity) // ✓ passes
z.number().finite().parse(Infinity) // ✗ throws

// Very large numbers
z.number().parse(Number.MAX_VALUE) // ✓ passes
z.number().safe().parse(Number.MAX_VALUE) // ✗ throws

// Floating point precision
z.number().multipleOf(0.1).parse(0.3) // ✓ passes
z.number().multipleOf(0.1).parse(0.30000000000000004) // May fail due to FP
```

## Type Inference

```typescript
const schema = z.number()
type Inferred = z.infer<typeof schema> // number

const intSchema = z.number().int()
type IntInferred = z.infer<typeof intSchema> // number (not branded)

// Optional number
const optional = z.number().optional()
type Optional = z.infer<typeof optional> // number | undefined
```

## With Coercion

```typescript
// Coerce string to number
const CoercedNumber = z.coerce.number()

z.coerce.number().parse("123") // 123
z.coerce.number().parse(123) // 123
z.coerce.number().parse(true) // 1
z.coerce.number().parse(null) // 0

// Coerced with validation
const CoercedAge = z.coerce.number()
  .int()
  .min(0)
  .max(150)
```

## Tips

1. **Use `.int()` for whole numbers**: Prevents decimal input
2. **Combine with `.safe()`**: Prevent overflow for large values
3. **Use `.step()` for precision**: Better than multipleOf for decimals
4. **Consider coercion**: `z.coerce.number()` for form input
5. **Floating point gotchas**: Test edge cases with decimal arithmetic
