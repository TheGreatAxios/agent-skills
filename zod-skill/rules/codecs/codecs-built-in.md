# Rule: Built-in Codecs

## Why It Matters

Zod provides pre-built codecs for common transformations. These handle wire formats, encoding, and type conversions with automatic bidirectional support.

## Available Codecs

| Codec | Input | Output |
|-------|-------|--------|
| `stringToNumber` | string | number |
| `stringToInt` | string | number (int) |
| `isoDatetimeToDate` | ISO string | Date |
| `base64ToBytes` | Base64 string | Uint8Array |
| `bytesToBase64` | Uint8Array | Base64 string |
| `jsonString` | JSON string | unknown |
| `trim` | string | string (trimmed) |
| `normalize` | string | string (normalized) |

## stringToNumber

Convert between string and number.

```typescript
import { z } from "zod"

const schema = z.string().pipe(z.codec.stringToNumber)

// Decode
schema.parse("123.45") // 123.45

// Encode
z.encode(schema, 123.45) // "123.45"
```

## stringToInt

Convert between string and integer.

```typescript
const schema = z.string().pipe(z.codec.stringToInt)

// Decode
schema.parse("42") // 42

// Encode
z.encode(schema, 42) // "42"

// Validation still applies
schema.parse("42.5") // Error - not an integer
```

## isoDatetimeToDate

Convert between ISO datetime string and Date.

```typescript
const schema = z.string().datetime().pipe(z.codec.isoDatetimeToDate)

// Decode
const date = schema.parse("2024-01-15T10:30:00Z")
// Date object

// Encode
z.encode(schema, new Date("2024-01-15T10:30:00Z"))
// "2024-01-15T10:30:00.000Z"
```

## base64ToBytes

Convert Base64 string to bytes.

```typescript
const schema = z.string().pipe(z.codec.base64ToBytes)

// Decode
const bytes = schema.parse("SGVsbG8gV29ybGQ=")
// Uint8Array

// Encode
const encoder = new TextEncoder()
z.encode(schema, encoder.encode("Hello World"))
// "SGVsbG8gV29ybGQ="
```

## bytesToBase64

Convert bytes to Base64 string.

```typescript
const schema = z.instanceof(Uint8Array).pipe(z.codec.bytesToBase64)

// Decode
const str = schema.parse(new TextEncoder().encode("Hello"))
// "SGVsbG8="

// Encode
z.encode(schema, "SGVsbG8=")
// Uint8Array
```

## jsonString

Parse and stringify JSON.

```typescript
const schema = z.string().pipe(z.codec.jsonString)

// Decode
const data = schema.parse('{"name":"John"}')
// { name: "John" }

// Encode
z.encode(schema, { name: "John" })
// '{"name":"John"}'
```

## trim

Trim whitespace (bidirectional).

```typescript
const schema = z.string().pipe(z.codec.trim)

// Decode: trim input
schema.parse("  hello  ") // "hello"

// Encode: (passthrough)
z.encode(schema, "hello") // "hello"
```

## normalize

Unicode normalization.

```typescript
const schema = z.string().pipe(z.codec.normalize("NFC"))

// Normalize to NFC form
schema.parse("café") // Normalized
```

## Common Patterns

### API Form Input

```typescript
const FormData = z.object({
  email: z.string().email(),
  age: z.string().pipe(z.codec.stringToInt),
  price: z.string().pipe(z.codec.stringToNumber),
  birthday: z.string().date().pipe(z.codec.isoDatetimeToDate)
})

// Form submission (strings)
const result = FormData.parse({
  email: "user@example.com",
  age: "25",
  price: "99.99",
  birthday: "1999-01-15"
})
// { email, age: 25, price: 99.99, birthday: Date }
```

### Database Storage

```typescript
const Document = z.object({
  id: z.string(),
  content: z.codec.base64ToBytes,
  metadata: z.codec.jsonString,
  createdAt: z.codec.isoDatetimeToDate
})

// Decode from DB (strings) -> application types
// Encode to DB (application types) -> strings
```

### URL Query Params

```typescript
const QuerySchema = z.object({
  page: z.string().pipe(z.codec.stringToInt).default("1"),
  limit: z.string().pipe(z.codec.stringToInt).default("20"),
  filter: z.codec.jsonString.optional()
})

// URL: ?page=2&limit=50&filter={"status":"active"}
const params = QuerySchema.parse(queryParams)
// { page: 2, limit: 50, filter: { status: "active" } }
```

### Binary File Upload

```typescript
const FileUpload = z.object({
  filename: z.string(),
  mimeType: z.string(),
  data: z.string().pipe(z.codec.base64ToBytes)
})

// JSON API with base64 file content
const upload = FileUpload.parse({
  filename: "document.pdf",
  mimeType: "application/pdf",
  data: "JVBERi0xLjQK..."
})
// upload.data is Uint8Array
```

### Cookie Values

```typescript
const SessionCookie = z.object({
  userId: z.string(),
  expires: z.string().pipe(z.codec.isoDatetimeToDate),
  data: z.codec.jsonString
})

// Parse cookie value
const session = SessionCookie.parse(JSON.parse(cookieValue))
```

## Combining Codecs

```typescript
// Multiple codecs in sequence
const schema = z.string()
  .pipe(z.codec.trim)
  .pipe(z.codec.stringToInt)

schema.parse("  42  ") // 42
```

## Custom Codec Pattern

```typescript
// Pattern for creating custom codecs
const currencyCodec = z.codec({
  // For encoding (application -> wire)
  encode: (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  },
  // For decoding (wire -> application)
  decode: (str: string): number => {
    const match = str.match(/^\$(\d+(?:\.\d{2})?)$/)
    if (!match) throw new Error("Invalid currency")
    return Math.round(parseFloat(match[1]) * 100)
  }
})

const Price = z.string().pipe(currencyCodec)
Price.parse("$10.99") // 1099
z.encode(Price, 1099) // "$10.99"
```

## Type Safety

```typescript
const schema = z.string().pipe(z.codec.stringToNumber)

// Decode type (what you get from parse)
type Output = z.infer<typeof schema> // number

// Encode type (what you pass to z.encode)
type Input = z.input<typeof schema> // string
```

## Tips

1. **Use for serialization**: Automatic encode/decode
2. **Form handling**: Convert string inputs to proper types
3. **API boundaries**: Handle wire formats cleanly
4. **Combine with validation**: Validate before/after codec
5. **z.encode for output**: Serialize application data
