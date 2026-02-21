# Rule: String ISO Formats

## Why It Matters

ISO datetime, date, and time formats provide standardized string representations for temporal data. Zod validates these formats strictly according to ISO 8601, ensuring consistent data interchange.

## Datetime Validation

```typescript
import { z } from "zod"

// ISO 8601 datetime
const Datetime = z.string().datetime()

// With options
const DatetimeWithOptions = z.string().datetime({
  message: "Invalid datetime",
  precision: 3,        // Millisecond precision
  offset: true,        // Require timezone offset
  local: false         // Disallow local (no offset)
})
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | string | - | Custom error message |
| `precision` | number | - | Require exact decimal precision |
| `offset` | boolean | false | Require timezone offset |
| `local` | boolean | false | Allow no timezone (local time) |

**Valid Datetime Examples**
```typescript
// Basic datetime (UTC with Z)
z.string().datetime().parse("2024-01-15T10:30:00Z")

// With milliseconds
z.string().datetime().parse("2024-01-15T10:30:00.123Z")

// With offset
z.string().datetime().parse("2024-01-15T10:30:00+02:00")

// With precision requirement
z.string().datetime({ precision: 3 }).parse("2024-01-15T10:30:00.000Z")
// Fails: "2024-01-15T10:30:00Z" (no milliseconds)
// Fails: "2024-01-15T10:30:00.12Z" (wrong precision)

// With offset required
z.string().datetime({ offset: true }).parse("2024-01-15T10:30:00+00:00")
// Fails: "2024-01-15T10:30:00Z" (uses Z, not offset)

// Local time (no timezone)
z.string().datetime({ local: true }).parse("2024-01-15T10:30:00")
```

**Invalid Datetime Examples**
```typescript
// These fail:
z.string().datetime().parse("2024-01-15")           // Date only
z.string().datetime().parse("10:30:00")             // Time only
z.string().datetime().parse("2024/01/15T10:30:00Z") // Wrong separator
z.string().datetime().parse("2024-01-15 10:30:00")  // Space instead of T
```

## Date Validation

```typescript
// ISO 8601 date (YYYY-MM-DD)
const Date = z.string().date()

// With custom message
const DateWithMessage = z.string().date({
  message: "Invalid date format"
})
```

**Valid Date Examples**
```typescript
z.string().date().parse("2024-01-15")
z.string().date().parse("1999-12-31")
z.string().date().parse("0001-01-01")
```

**Invalid Date Examples**
```typescript
// These fail:
z.string().date().parse("2024-1-15")     // Single digit month
z.string().date().parse("15-01-2024")    // Wrong order
z.string().date().parse("2024/01/15")    // Wrong separator
z.string().date().parse("2024-01-15T10:30:00Z") // Has time
```

## Time Validation

```typescript
// ISO 8601 time (HH:MM:SS)
const Time = z.string().time()

// With options
const TimeWithOptions = z.string().time({
  message: "Invalid time",
  precision: 3,    // Millisecond precision
  offset: true     // Require timezone offset
})
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | string | - | Custom error message |
| `precision` | number | - | Require exact decimal precision |
| `offset` | boolean | false | Require timezone offset |

**Valid Time Examples**
```typescript
z.string().time().parse("10:30:00")
z.string().time().parse("23:59:59")
z.string().time().parse("00:00:00")

// With milliseconds
z.string().time().parse("10:30:00.123")

// With offset
z.string().time().parse("10:30:00+02:00")
z.string().time().parse("10:30:00Z")

// With precision
z.string().time({ precision: 3 }).parse("10:30:00.000")
```

**Invalid Time Examples**
```typescript
// These fail:
z.string().time().parse("25:00:00")    // Invalid hour
z.string().time().parse("10:60:00")    // Invalid minute
z.string().time().parse("10:30")       // Missing seconds
```

## Duration Validation

```typescript
// ISO 8601 duration
const Duration = z.string().duration()

// With message
const DurationWithMessage = z.string().duration({
  message: "Invalid duration format"
})
```

**Duration Format** (P[n]Y[n]M[n]DT[n]H[n]M[n]S)

```typescript
z.string().duration().parse("PT1H30M")      // 1 hour 30 minutes
z.string().duration().parse("PT15M")        // 15 minutes
z.string().duration().parse("PT1H30M15S")   // 1h 30m 15s
z.string().duration().parse("P1Y2M3DT4H5M6S") // 1 year, 2 months...
z.string().duration().parse("P1W")          // 1 week
```

## Common Patterns

### Combined with Transform

```typescript
// Parse datetime string to Date object
const DateFromDatetime = z.string()
  .datetime()
  .transform(str => new Date(str))

// Parse date string to Date (at midnight UTC)
const DateFromString = z.string()
  .date()
  .transform(str => new Date(`${str}T00:00:00Z`))
```

### API Response Schema

```typescript
const ApiEvent = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  startTime: z.string().datetime({ offset: true }),
  duration: z.string().duration()
})
```

### Date Range Validation

```typescript
const DateRange = z.object({
  start: z.string().date(),
  end: z.string().date()
}).refine(
  ({ start, end }) => new Date(start) <= new Date(end),
  { message: "End date must be after start date" }
)
```

### Time Slot Schema

```typescript
const TimeSlot = z.object({
  date: z.string().date(),
  startTime: z.string().time(),
  endTime: z.string().time()
}).refine(
  ({ startTime, endTime }) => startTime < endTime,
  { message: "End time must be after start time" }
)
```

## ISO 8601 Quick Reference

### Datetime Formats

| Format | Example |
|--------|---------|
| UTC | `2024-01-15T10:30:00Z` |
| With offset | `2024-01-15T10:30:00+02:00` |
| With milliseconds | `2024-01-15T10:30:00.123Z` |
| With microseconds | `2024-01-15T10:30:00.123456Z` |
| Local (no TZ) | `2024-01-15T10:30:00` |

### Date Formats

| Format | Example |
|--------|---------|
| Calendar date | `2024-01-15` |
| Week date | `2024-W03-1` |
| Ordinal date | `2024-015` |

### Time Formats

| Format | Example |
|--------|---------|
| Basic | `10:30:00` |
| With fraction | `10:30:00.5` |
| With offset | `10:30:00+02:00` |
| UTC | `10:30:00Z` |

### Duration Format

| Component | Symbol | Example |
|-----------|--------|---------|
| Years | Y | `P1Y` |
| Months | M | `P1M` |
| Days | D | `P1D` |
| Hours | H | `PT1H` |
| Minutes | M | `PT1M` |
| Seconds | S | `PT1S` |

## Tips

1. **Use `.datetime()` for full timestamps**: More specific than generic string patterns
2. **Consider timezone requirements**: Use `offset: true` when timezone matters
3. **Transform to Date objects**: Combine with `.transform()` for runtime Date values
4. **Validate ranges separately**: Use `.refine()` for start/end comparisons
5. **Document format expectations**: ISO 8601 has variations; be explicit
