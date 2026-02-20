# Rule: Date Validation

## Why It Matters

Date validation ensures Date objects fall within expected ranges. Use for birth dates, event timestamps, expiration dates, and any temporal data requiring runtime validation.

## Basic Usage

```typescript
import { z } from "zod"

// Basic date
const EventDate = z.date()

// With type inference
type EventDate = z.infer<typeof EventDate> // Date
```

## Range Constraints

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(date)` | Minimum date | `z.date().min(new Date())` |
| `.max(date)` | Maximum date | `z.date().max(futureDate)` |

```typescript
// Future date only
const FutureDate = z.date().min(new Date(), "Date must be in the future")

// Past date only
const PastDate = z.date().max(new Date(), "Date must be in the past")

// Date range
const StartDate = z.date()
const EndDate = z.date().min(new Date())

// Specific range
const BookingDate = z.date()
  .min(new Date("2024-01-01"))
  .max(new Date("2024-12-31"))
```

## Common Patterns

### Birth Date

```typescript
const minBirthDate = new Date()
minBirthDate.setFullYear(minBirthDate.getFullYear() - 120)

const maxBirthDate = new Date()
maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18)

const BirthDate = z.date()
  .min(minBirthDate, "Invalid birth date")
  .max(maxBirthDate, "Must be at least 18 years old")
```

### Event Dates

```typescript
const now = new Date()
const oneYearFromNow = new Date()
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

const EventDate = z.date()
  .min(now, "Event must be in the future")
  .max(oneYearFromNow, "Event must be within one year")
```

### Expiration Date

```typescript
const ExpirationDate = z.date()
  .min(new Date(), "Expiration must be in the future")
```

### Date Range Object

```typescript
const DateRange = z.object({
  start: z.date(),
  end: z.date()
}).refine(
  ({ start, end }) => start < end,
  { message: "End date must be after start date" }
)
```

## With Coercion

```typescript
// Coerce string/number to Date
const CoercedDate = z.coerce.date()

z.coerce.date().parse("2024-01-15") // Date object
z.coerce.date().parse("2024-01-15T10:30:00Z") // Date object
z.coerce.date().parse(1705312200000) // Date from timestamp
z.coerce.date().parse(new Date()) // Date object (unchanged)

// Coerced with validation
const FutureCoercedDate = z.coerce.date()
  .min(new Date())
```

## Transform Patterns

### Date to ISO String

```typescript
const DateToIso = z.date()
  .transform(d => d.toISOString())

// Result: "2024-01-15T10:30:00.000Z"
```

### Date to Timestamp

```typescript
const DateToTimestamp = z.date()
  .transform(d => d.getTime())

// Result: 1705312200000
```

### Date to Formatted String

```typescript
const DateToLocale = z.date()
  .transform(d => d.toLocaleDateString("en-US"))

// Result: "1/15/2024"
```

### String to Date (via coercion + transform)

```typescript
const IsoToDate = z.string().datetime()
  .transform(s => new Date(s))
```

## Custom Error Messages

```typescript
const EventDate = z.date({
  required_error: "Event date is required",
  invalid_type_error: "Please provide a valid date"
})

// Per-constraint messages
const FutureDate = z.date()
  .min(new Date(), { message: "Date must be in the future" })
```

## Edge Cases

```typescript
// Valid inputs
z.date().parse(new Date()) // ✓
z.date().parse(new Date("2024-01-15")) // ✓

// Invalid inputs
z.date().parse("2024-01-15") // ✗ throws (use z.coerce.date())
z.date().parse(1705312200000) // ✗ throws (use z.coerce.date())
z.date().parse(null) // ✗ throws

// Invalid Date object
z.date().parse(new Date("invalid")) // ✗ throws (Invalid Date)

// Boundary validation
const now = new Date()
z.date().min(now).parse(new Date(now.getTime() - 1)) // ✗ throws
z.date().min(now).parse(new Date(now.getTime() + 1)) // ✓ passes
```

## Type Inference

```typescript
const schema = z.date()
type Inferred = z.infer<typeof schema> // Date

const optional = z.date().optional()
type Optional = z.infer<typeof optional> // Date | undefined

const nullable = z.date().nullable()
type Nullable = z.infer<typeof nullable> // Date | null
```

## Comparison Table

| Method | Input | Output |
|--------|-------|--------|
| `z.date()` | Date object | Date object |
| `z.coerce.date()` | Date, string, number | Date object |
| `z.string().datetime()` | ISO string | string |
| `z.string().date()` | ISO date string | string |

## Tips

1. **Use `z.coerce.date()` for input**: Handles strings and timestamps
2. **Validate ranges**: Use `.min()` and `.max()` for boundaries
3. **Combine with object refinement**: For start/end date validation
4. **Transform for serialization**: Use `.transform()` for JSON output
5. **Invalid Date check**: Zod validates that Date objects are valid
