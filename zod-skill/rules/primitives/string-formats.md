# Rule: String Formats

## Why It Matters

Built-in format validators provide standardized validation for common patterns like emails, URLs, and UUIDs. These are more reliable than custom regex and handle edge cases correctly.

## Available Formats

| Method | Validates | RFC/Standard |
|--------|-----------|--------------|
| `.email()` | Email address | RFC 5322 |
| `.url()` | URL | RFC 3986 |
| `.uuid()` | UUID | RFC 4122 |
| `.ip()` | IP address | IPv4/IPv6 |
| `.cidr()` | CIDR notation | RFC 4632 |
| `.mac()` | MAC address | IEEE 802 |
| `.jwt()` | JWT format | RFC 7519 |
| `.hash()` | Hash string | Various |
| `.emoji()` | Emoji only | Unicode |
| `.cuid()` | CUID v1 | collision.ai |
| `.cuid2()` | CUID v2 | collision.ai |
| `.ulid()` | ULID | ulid/spec |

## Email Validation

```typescript
const Email = z.string().email()

// With custom message
const EmailWithMessage = z.string().email("Invalid email address")

// Strict validation options
const StrictEmail = z.string().email({
  message: "Invalid email",
  // Additional options available in v4
})
```

**Email Edge Cases**
```typescript
// These pass:
z.string().email().parse("user@example.com")
z.string().email().parse("user.name+tag@example.co.uk")
z.string().email().parse("user@subdomain.example.com")

// These fail:
z.string().email().parse("invalid-email")
z.string().email().parse("@example.com")
z.string().email().parse("user@")
```

## URL Validation

```typescript
const Url = z.string().url()

// With custom message
const UrlWithMessage = z.string().url("Must be a valid URL")

// Common pattern: require HTTPS
const SecureUrl = z.string()
  .url()
  .startsWith("https://", "Must use HTTPS")
```

**URL Options** (v4)
```typescript
const UrlWithProtocol = z.string().url({
  message: "Invalid URL",
  // Protocol requirements, etc.
})
```

**URL Edge Cases**
```typescript
// These pass:
z.string().url().parse("https://example.com")
z.string().url().parse("http://localhost:3000")
z.string().url().parse("ftp://files.example.com")

// These fail:
z.string().url().parse("example.com")       // No protocol
z.string().url().parse("not a url")         // Invalid format
```

## UUID Validation

```typescript
const Uuid = z.string().uuid()

// With custom message
const UuidWithMessage = z.string().uuid("Invalid UUID")

// Version-specific (v4)
const UuidV4 = z.string().uuid({ version: "v4" })

// Version-specific (v7)
const UuidV7 = z.string().uuid({ version: "v7" })
```

**UUID Versions**
| Version | Description |
|---------|-------------|
| `v1` | Time-based |
| `v3` | Name-based (MD5) |
| `v4` | Random |
| `v5` | Name-based (SHA-1) |
| `v6` | reordered time |
| `v7` | Unix Epoch |
| `v8` | Custom |

```typescript
// Example UUIDs
z.string().uuid().parse("123e4567-e89b-12d3-a456-426614174000") // v1
z.string().uuid({ version: "v4" }).parse("123e4567-e89b-42d3-a456-426614174000")
```

## IP Address Validation

```typescript
// Any IP version
const Ip = z.string().ip()

// IPv4 only
const Ipv4 = z.string().ip({ version: "v4" })

// IPv6 only
const Ipv6 = z.string().ip({ version: "v6" })

// With message
const IpWithMessage = z.string().ip({
  version: "v4",
  message: "Invalid IPv4 address"
})
```

**IP Examples**
```typescript
// IPv4
z.string().ip({ version: "v4" }).parse("192.168.1.1")
z.string().ip({ version: "v4" }).parse("0.0.0.0")
z.string().ip({ version: "v4" }).parse("255.255.255.255")

// IPv6
z.string().ip({ version: "v6" }).parse("::1")
z.string().ip({ version: "v6" }).parse("2001:db8::1")
z.string().ip({ version: "v6" }).parse("fe80::1")
```

## CIDR Validation

```typescript
const Cidr = z.string().cidr()

// Version-specific
const CidrV4 = z.string().cidr({ version: "v4" })
const CidrV6 = z.string().cidr({ version: "v6" })

// With message
const CidrWithMessage = z.string().cidr({
  version: "v4",
  message: "Invalid CIDR notation"
})
```

**CIDR Examples**
```typescript
z.string().cidr({ version: "v4" }).parse("192.168.1.0/24")
z.string().cidr({ version: "v6" }).parse("2001:db8::/32")
```

## MAC Address Validation

```typescript
const Mac = z.string().mac()

// With message
const MacWithMessage = z.string().mac("Invalid MAC address")

// Accepts multiple formats:
// - 01:23:45:67:89:ab
// - 01-23-45-67-89-ab
// - 0123.4567.89ab
```

## JWT Validation

```typescript
const Jwt = z.string().jwt()

// With algorithm requirement
const JwtWithAlg = z.string().jwt({ alg: "HS256" })

// With message
const JwtWithMessage = z.string().jwt({
  message: "Invalid JWT token"
})
```

**Supported Algorithms**
| Algorithm | Type |
|-----------|------|
| `HS256` | HMAC SHA-256 |
| `HS384` | HMAC SHA-384 |
| `HS512` | HMAC SHA-512 |
| `RS256` | RSA SHA-256 |
| `RS384` | RSA SHA-384 |
| `RS512` | RSA SHA-512 |
| `ES256` | ECDSA SHA-256 |
| `ES384` | ECDSA SHA-384 |
| `ES512` | ECDSA SHA-512 |

## Hash Validation

```typescript
const Sha256 = z.string().hash("sha256")

// Supported algorithms
const Md5 = z.string().hash("md5")
const Sha1 = z.string().hash("sha1")
const Sha512 = z.string().hash("sha512")
```

**Supported Hashes**
| Algorithm | Length |
|-----------|--------|
| `md5` | 32 chars |
| `sha1` | 40 chars |
| `sha256` | 64 chars |
| `sha384` | 96 chars |
| `sha512` | 128 chars |

## Emoji Validation

```typescript
const EmojiOnly = z.string().emoji()

// Only emoji characters allowed
z.string().emoji().parse("😀") // ✓
z.string().emoji().parse("hello") // ✗
```

## Identifier Formats

### CUID / CUID2

```typescript
const Cuid = z.string().cuid()
const Cuid2 = z.string().cuid2()

// CUID2 is collision-resistant and horizontally scalable
z.string().cuid2().parse("clh1234567890abcdefghijklmnopqrstuv")
```

### ULID

```typescript
const Ulid = z.string().ulid()

// ULID: Universally Unique Lexicographically Sortable Identifier
z.string().ulid().parse("01H5Z7Z1Z1Z1Z1Z1Z1Z1Z1Z1Z")
```

## Combining Formats

```typescript
// Email with length constraint
const BoundedEmail = z.string()
  .email()
  .max(255, "Email too long")

// URL with protocol requirement
const ApiUrl = z.string()
  .url()
  .startsWith("https://")
  .endsWith("/api/")

// UUID with prefix
const PrefixedUuid = z.string()
  .startsWith("user_")
  .and(z.string().uuid())
```

## Custom Formats with Regex

When built-in formats don't cover your needs:

```typescript
// Phone number (varies by region)
const Phone = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  "Invalid phone number"
)

// Hex color
const HexColor = z.string().regex(
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  "Invalid hex color"
)

// Slug
const Slug = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Invalid slug format"
)

// Credit card (basic Luhn)
const CreditCard = z.string().regex(
  /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/,
  "Invalid card number"
)
```

## Tips

1. **Prefer built-in formats**: More reliable than custom regex
2. **Combine with length limits**: Prevent abuse of valid formats
3. **URL protocols**: Add `.startsWith()` for protocol requirements
4. **Error messages**: Provide user-friendly validation messages
5. **Test edge cases**: Each format has specific edge cases
