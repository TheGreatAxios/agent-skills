# Rule: Codecs Basics

## Why It Matters

Codecs provide bidirectional encoding and decoding of data. Use for serialization, format conversion, and handling wire formats with automatic two-way transformation.

## z.codec()

Create a codec with encode/decode functions.

```typescript
import { z } from "zod"

// Basic codec structure
const myCodec = z.codec({
  encode: (value) => transformedValue,
  decode: (value) => originalValue
})
```

## Built-in Codecs

### stringToNumber

```typescript
const num = z.codec.stringToNumber

// Decode (parse): string -> number
num.decode("123") // 123

// Encode (serialize): number -> string
num.encode(123) // "123"
```

### stringToInt

```typescript
const int = z.codec.stringToInt

int.decode("42") // 42
int.encode(42) // "42"
```

### isoDatetimeToDate

```typescript
const date = z.codec.isoDatetimeToDate

date.decode("2024-01-15T10:30:00Z") // Date object
date.encode(new Date("2024-01-15T10:30:00Z")) // ISO string
```

### base64ToBytes

```typescript
const bytes = z.codec.base64ToBytes

bytes.decode("SGVsbG8=") // Uint8Array
bytes.encode(new TextEncoder().encode("Hello")) // "SGVsbG8="
```

### bytesToBase64

```typescript
const b64 = z.codec.bytesToBase64

b64.decode(new TextEncoder().encode("Hello")) // "SGVsbG8="
b64.encode("SGVsbG8=") // Uint8Array
```

## Using Codecs

### Decode (Parse Input)

```typescript
const schema = z.string().pipe(z.codec.stringToNumber)

const result = schema.parse("123") // 123 (number)
```

### Encode (Serialize Output)

```typescript
const schema = z.number().pipe(z.codec.stringToNumber)

const encoded = z.encode(schema, 123) // "123"
```

## Common Patterns

### API Input/Output

```typescript
// Input: Accept string, decode to number
const Input = z.string().pipe(z.codec.stringToNumber)

// Output: Number to string for JSON
const Output = z.number().pipe(z.codec.stringToNumber)

// Use in schema
const CreateItem = z.object({
  quantity: z.string().pipe(z.codec.stringToInt),
  price: z.string().pipe(z.codec.stringToNumber)
})
```

### Date Handling

```typescript
// ISO string <-> Date
const DateField = z.string().datetime()
  .pipe(z.codec.isoDatetimeToDate)

// API accepts ISO string, internally uses Date
const Event = z.object({
  id: z.string(),
  timestamp: DateField
})

// Parse: string -> Date
const event = Event.parse({
  id: "1",
  timestamp: "2024-01-15T10:30:00Z"
})
// event.timestamp is Date

// Encode: Date -> string
const encoded = z.encode(Event, event)
// encoded.timestamp is ISO string
```

### Binary Data

```typescript
// Base64 string <-> bytes
const FileContent = z.string().pipe(z.codec.base64ToBytes)

// Accept base64, work with bytes internally
const Document = z.object({
  filename: z.string(),
  content: FileContent
})
```

### URL Parameters

```typescript
// Query param as number
const QueryParam = z.string().pipe(z.codec.stringToInt)

const Pagination = z.object({
  page: QueryParam.default("1"),
  limit: QueryParam.default("20")
})

// URL: ?page=2&limit=50
// Result: { page: 2, limit: 50 }
```

### Form Data

```typescript
// Form string to boolean
const Checkbox = z.string()
  .transform(s => s === "true" || s === "on")

// Form string to array
const Tags = z.string()
  .transform(s => s.split(",").map(t => t.trim()))
```

## Custom Codecs

```typescript
// Create custom codec
const hexToNumber = z.codec({
  encode: (n: number) => n.toString(16),
  decode: (s: string) => parseInt(s, 16)
})

// Use with pipe
const HexField = z.string().regex(/^[0-9a-f]+$/).pipe(hexToNumber)
```

### Custom Codec with Validation

```typescript
const currencyCodec = z.codec({
  encode: (cents: number) => `$${(cents / 100).toFixed(2)}`,
  decode: (s: string) => {
    const match = s.match(/^\$(\d+(?:\.\d{2})?)$/)
    if (!match) throw new Error("Invalid currency format")
    return Math.round(parseFloat(match[1]) * 100)
  }
})

const Price = z.string().pipe(currencyCodec)

Price.parse("$10.99") // 1099 (cents)
z.encode(Price, 1099) // "$10.99"
```

## Codec vs Transform

| Feature | Codec | Transform |
|---------|-------|-----------|
| Direction | Bidirectional | One-way |
| Encode method | Built-in | Manual |
| Use case | Serialization | Validation/modification |

```typescript
// Transform: One-way
const Upper = z.string().transform(s => s.toUpperCase())

// Codec: Two-way
const UpperCodec = z.codec({
  encode: (s: string) => s.toLowerCase(),
  decode: (s: string) => s.toUpperCase()
})
```

## Type Inference

```typescript
const schema = z.string().pipe(z.codec.stringToNumber)

// Decode type (input -> output)
type Decoded = z.infer<typeof schema> // number

// Encode type (output -> input)
type Encoded = z.input<typeof schema> // string
```

## Tips

1. **Use for wire formats**: Convert between representations
2. **Built-in codecs**: stringToNumber, isoDatetimeToDate, base64
3. **Custom codecs**: Create for domain-specific formats
4. **Encode for output**: z.encode() serializes data
5. **Type safety**: Input/output types differ with codecs
