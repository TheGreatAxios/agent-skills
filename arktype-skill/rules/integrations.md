# Rule: integrations

## Why It Matters

ArkType provides first-party packages for environment variables, regex, and testing. Using these official packages ensures consistent APIs and optimal type safety.

## ArkEnv (Environment Variables)

ArkEnv brings ArkType's power to environment variables. Validate, parse, and transform env values with full type safety.

### Basic Setup

```typescript
import { arkenv } from "arkenv"

const env = arkenv({
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production' | 'test' = 'development'"
})

console.log(env.HOST)  // string
console.log(env.PORT)  // number
console.log(env.NODE_ENV)  // "development" | "production" | "test"
```

### Env-Specific Keywords

| Keyword | Validates | Example |
|---------|----------|---------|
| `string.host` | Valid hostname | `"localhost"`, `"example.com"` |
| `string.url` | Valid URL | `"https://api.example.com"` |
| `number.port` | Port 1-65535 | `3000`, `8080` |
| `string.email` | Email format | `"user@example.com"` |
| `string.uuid.v4` | UUID v4 | `"123e4567-e89b-12d3-a456-426614174000"` |

### Complete Example

```typescript
import { arkenv } from "arkenv"

const env = arkenv({
  // Server config
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production' | 'test'",

  // Database
  DATABASE_URL: "string.url",
  DATABASE_POOL_SIZE: "number.integer > 0 = 10",

  // API
  API_KEY: "string",
  API_TIMEOUT: "number > 0 = 5000",

  // Feature flags
  ENABLE_CACHE: "boolean = false",
  LOG_LEVEL: "'debug' | 'info' | 'warn' | 'error' = 'info'"
})

// Usage with full type safety
const server = {
  host: env.HOST,
  port: env.PORT,
  isDev: env.NODE_ENV === "development"
}
```

### Default Values

Use `=` suffix for defaults:

```typescript
const env = arkenv({
  // If missing, defaults to "development"
  NODE_ENV: "'development' | 'production' = 'development'",

  // If missing, defaults to 3000
  PORT: "number.port = 3000",

  // If missing, defaults to false
  DEBUG: "boolean = false"
})
```

### Optional Values

Use `?` suffix for optional env vars:

```typescript
const env = arkenv({
  REQUIRED_VAR: "string",
  "OPTIONAL_VAR?": "string"
})

// TypeScript knows OPTIONAL_VAR is string | undefined
if (env.OPTIONAL_VAR) {
  console.log(env.OPTIONAL_VAR.toUpperCase())
}
```

### Numeric Constraints

```typescript
const env = arkenv({
  // Positive timeout
  TIMEOUT: "number > 0",

  // Bounded pool size
  POOL_SIZE: "1 <= number.integer <= 100",

  // Port (built-in keyword)
  PORT: "number.port"  // 1-65535
})
```

### String Formats

```typescript
const env = arkenv({
  // Hostname validation
  ALLOWED_HOSTS: "string.host[]",

  // URL validation
  REDIS_URL: "string.url",

  // Email validation
  ADMIN_EMAIL: "string.email",

  // JSON parsing
  CONFIG_JSON: "string.json.parse"
})
```

### With Transformations

```typescript
const env = arkenv({
  // Parse JSON to object
  FEATURES: ["string.json.parse", "=>", (s): object => JSON.parse(s)],

  // Parse comma-separated list
  ALLOWED_ORIGINS: ["string", "=>", (s): string[] => s.split(",")]
})
```

### Validation Error Handling

```typescript
try {
  const env = arkenv({
    REQUIRED: "string",
    PORT: "number.port"
  })
} catch (errors) {
  // ArkErrors instance
  console.error("Invalid env:")
  for (const error of errors) {
    console.error(`  ${error.path.join(".")}: ${error.summary}`)
  }
}
```

### Prefix Support

```typescript
const env = arkenv({
  // All vars starting with MY_APP_ are available
  "MY_APP_*": {
    MY_APP_HOST: "string.host",
    MY_APP_PORT: "number.port"
  }
})
```

### Custom Source (not process.env)

```typescript
const config = {
  HOST: "localhost",
  PORT: "3000",
  NODE_ENV: "development"
}

const env = arkenv(config, {
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production'"
})
```

## ArkRegex (Type-safe RegExp)

ArkRegex is a drop-in replacement for `new RegExp()` with full type safety. It infers capture group types and provides typed `.test()` and `.exec()` methods.

### Installation

```bash
pnpm install arkregex
# or
npm install arkregex
```

Requires TypeScript 5.9+

### Basic Pattern

```typescript
import { regex } from "arkregex"

const ok = regex("^ok$", "i")
// Regex<"ok" | "oK" | "Ok" | "OK", { flags: "i" }>

ok.test("OK")     // true
ok.test("not ok") // false
```

### With Captures

```typescript
const semver = regex("^(\\d*)\\.(\\d*)\\.(\\d*)$")
// Regex<`${bigint}.${bigint}.${bigint}`, { captures: [bigint, bigint, bigint] }

const match = semver.exec("1.2.3")
if (match) {
  console.log(match.captures)  // ["1", "2", "3"]
}
```

### Named Groups

```typescript
const email = regex("^(?<name>\\w+)@(?<domain>\\w+\\.\\w+)$")
// Regex<`${string}@${string}.${string}`, { names: { name: string; domain: `${string}.${string}`; } }

const match = email.exec("user@example.com")
if (match) {
  console.log(match.groups.name)    // "user"
  console.log(match.groups.domain)  // "example.com"
}
```

### regex.as() for Manual Typing

```typescript
const complex = regex.as<
  `pattern-${string}`,
  { captures: [string] }
>("very-long-complex-expression-here")
```

### Common Patterns

```typescript
// Semver
const semver = regex("^(?<major>0|[1-9]\\d*)\\.(?<minor>0|[1-9]\\d*)\\.(?<patch>0|[1-9]\\d*)$")

// Email
const email = regex("^(?<local>[\\w.+-]+)@(?<domain>[\\w-]+\\.[a-z]{2,})$")

// UUID v4
const uuid = regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
```

## JSON Schema

### Type to JSON Schema

```typescript
import { type } from "arktype"

const User = type({
  name: "string",
  email: "string.email",
  "age?": "number >= 18"
})

const schema = User.toJsonSchema()
// {
//   $schema: "https://json-schema.org/draft/2020-12/schema",
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     email: { type: "string", format: "email", pattern: "..." },
//     age: { type: "number", minimum: 18 }
//   },
//   required: ["name", "email"]
// }
```

### JSON Schema to Type

```typescript
import { jsonSchemaToType } from "@ark/json-schema"

const T = jsonSchemaToType({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number", minimum: 0 }
  },
  required: ["name"]
})
```

### Custom Fallbacks

```typescript
const schema = T.toJsonSchema({
  fallback: {
    date: ctx => ({
      ...ctx.base,
      type: "string",
      format: "date-time"
    }),
    default: ctx => ctx.base
  }
})
```

## Integration Packages Summary

| Integration | Package | Usage |
|-------------|---------|-------|
| RegExp | arkregex | `regex()` |
| Env vars | arkenv | `arkenv()` |
| JSON Schema | @ark/json-schema | `jsonSchemaToType()` |
| Testing | @ark/attest | `attest()` |

## Common Patterns

| Feature | ArkType Feature | Package |
|---------|-----------------|---------|
| Type-safe regex | ArkRegex | arkregex |
| Env validation | ArkEnv | arkenv |
| JSON Schema | toJsonSchema() | @ark/json-schema |
| Testing | Attest | @ark/attest |


## ArkEnv (Environment Variables)

ArkEnv brings ArkType's power to environment variables. Validate, parse, and transform env values with full type safety.

### Basic Setup

```typescript
import { arkenv } from "arkenv"

const env = arkenv({
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production' | 'test' = 'development'"
})

// TypeScript knows exact types!
console.log(env.HOST)     // (property) HOST: string
console.log(env.PORT)     // (property) PORT: number
console.log(env.NODE_ENV) // (property) NODE_ENV: "development" | "production" | "test"
```

### Env-Specific Keywords

| Keyword | Validates | Example |
|---------|----------|---------|
| `string.host` | Valid hostname | `"localhost"`, `"example.com"` |
| `string.url` | Valid URL | `"https://api.example.com"` |
| `number.port` | Port 1-65535 | `3000`, `8080` |
| `string.email` | Email format | `"user@example.com"` |
| `string.uuid.v4` | UUID v4 | `"123e4567-e89b-12d3-a456-426614174000"` |

### Complete Example

```typescript
import { arkenv } from "arkenv"

const env = arkenv({
  // Server config
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production' | 'test'",

  // Database
  DATABASE_URL: "string.url",
  DATABASE_POOL_SIZE: "number.integer > 0 = 10",

  // API
  API_KEY: "string",
  API_TIMEOUT: "number > 0 = 5000",

  // Feature flags
  ENABLE_CACHE: "boolean = false",
  LOG_LEVEL: "'debug' | 'info' | 'warn' | 'error' = 'info'"
})

// Usage with full type safety
const server = {
  host: env.HOST,
  port: env.PORT,
  isDev: env.NODE_ENV === "development"
}
```

### Default Values

Use `=` suffix for defaults:

```typescript
const env = arkenv({
  // If missing, defaults to "development"
  NODE_ENV: "'development' | 'production' = 'development'",

  // If missing, defaults to 3000
  PORT: "number.port = 3000",

  // If missing, defaults to false
  DEBUG: "boolean = false"
})
```

### Optional Values

Use `?` suffix for optional env vars:

```typescript
const env = arkenv({
  REQUIRED_VAR: "string",
  "OPTIONAL_VAR?": "string"
})

// TypeScript knows OPTIONAL_VAR is string | undefined
if (env.OPTIONAL_VAR) {
  console.log(env.OPTIONAL_VAR.toUpperCase())
}
```

### Numeric Constraints

```typescript
const env = arkenv({
  // Positive timeout
  TIMEOUT: "number > 0",

  // Bounded pool size
  POOL_SIZE: "1 <= number.integer <= 100",

  // Port (built-in keyword)
  PORT: "number.port"  // 1-65535
})
```

### String Formats

```typescript
const env = arkenv({
  // Hostname validation
  ALLOWED_HOSTS: "string.host[]",

  // URL validation
  REDIS_URL: "string.url",

  // Email validation
  ADMIN_EMAIL: "string.email",

  // JSON parsing
  CONFIG_JSON: "string.json.parse"
})
```

### With Transformations

```typescript
const env = arkenv({
  // Parse JSON to object
  FEATURES: ["string.json.parse", "=>", (s): object => JSON.parse(s)],

  // Parse comma-separated list
  ALLOWED_ORIGINS: ["string", "=>", (s): string[] => s.split(",")]
})
```

### Prefix Support

```typescript
const env = arkenv({
  // All vars starting with MY_APP_ are available
  "MY_APP_*": {
    MY_APP_HOST: "string.host",
    MY_APP_PORT: "number.port"
  }
})
```

### Custom Source (not process.env)

```typescript
import { arkenv } from "arkenv"

const config = {
  HOST: "localhost",
  PORT: "3000",
  NODE_ENV: "development"
}

const env = arkenv(config, {
  HOST: "string.host",
  PORT: "number.port",
  NODE_ENV: "'development' | 'production'"
})
```

### Validation Error Handling

```typescript
import { arkenv } from "arkenv"

try {
  const env = arkenv({
    REQUIRED: "string",
    PORT: "number.port"
  })
} catch (errors) {
  // ArkErrors instance
  console.error("Invalid env:")
  for (const error of errors) {
    console.error(`  ${error.path.join(".")}: ${error.summary}`)
  }
}
```

### Runtime vs Build-time

```typescript
// At build time (bundle time)
const env = arkenv({
  API_URL: "string.url"
})

// At runtime (validation happens on import)
if (env.API_URL.includes("localhost")) {
  // Development mode
}
```

### Type Inference

```typescript
const env = arkenv({
  HOST: "string.host",
  PORT: "number.port"
})

// Inferred types:
type Env = typeof env
// {
//   HOST: string
//   PORT: number
// }
```

### ArkEnv vs Alternatives

| Feature | ArkEnv | T3 Env | Zod |
|---------|---------|--------|-----|
| ArkType types | ✓ | ✗ | ✗ |
| Custom keywords | ✓ | Limited | Manual |
| Transformation | ✓ | ✓ | Manual |
| Prefix support | ✓ | ✓ | ✗ |
| Bundle size | Small | Small | Large (with Zod) |

## JSON Schema Conversion

### Type to JSON Schema

```typescript
import { type } from "arktype"

const User = type({
  name: "string",
  email: "string.email",
  "age?": "number >= 18"
})

const schema = User.toJsonSchema()
// {
//   $schema: "https://json-schema.org/draft/2020-12/schema",
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     email: { type: "string", format: "email", pattern: "..." },
//     age: { type: "number", minimum: 18 }
//   },
//   required: ["name", "email"]
// }
```

### JSON Schema to Type

```typescript
import { jsonSchemaToType } from "@ark/json-schema"

const T = jsonSchemaToType({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number", minimum: 0 }
  },
  required: ["name"]
})
```

### Custom Fallbacks

```typescript
const schema = T.toJsonSchema({
  fallback: {
    date: ctx => ({
      ...ctx.base,
      type: "string",
      format: "date-time"
    }),
    default: ctx => ctx.base  // "just make it work"
  }
})
```

## Integration Packages Summary

| Integration | Package | Usage |
|-------------|---------|-------|
| tRPC | Native (>=11) | `.input(type(...))` |
| tRPC | Native (<11) | `.input(type(...).assert)` |
| react-hook-form | @hookform/resolvers/arktype | `arktypeResolver()` |
| Hono | @hono/arktype-validator | `arktypeValidator()` |
| oRPC | Native (Standard Schema) | `os.input()` |
| Drizzle | drizzle-arktype | `createSelectSchema()` |
| RegExp | arkregex | `regex()` |
| Env vars | arkenv | `arkenv()` |
| JSON Schema | @ark/json-schema | `jsonSchemaToType()` |

### ArkRegex Features Summary

| Feature | Description |
|---------|-------------|
| Type inference | Infers capture types from pattern |
| Zero runtime | Uses native RegExp at runtime |
| Named groups | `.groups` object is fully typed |
| Positional captures | `.captures` tuple is typed |
| TS 5.9+ | Required for best experience |

### ArkEnv Keywords Summary

| Keyword | Validates | Range/Format |
|---------|----------|-------------|
| `string.host` | Hostname | `"localhost"`, `"example.com"` |
| `string.url` | URL | `"https://api.example.com"` |
| `number.port` | Port | 1-65535 |
| `string.email` | Email | Standard email format |
| `string.uuid.v4` | UUID v4 | `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |

## Testing Integrations

### With Attest

```typescript
import { attest } from "@ark/attest"

it("tRPC input type", () => {
  const inputType = t.procedure.input(User)._def.input
  attest(inputType).snap({ name: "string", "age?": "number" })
})
```

## Integration Tips

1. **Use `.assert`** for tRPC < 11
2. **Specify target** for Hono (`"json"`, `"query"`, `"form"`)
3. **Drizzle schemas** → ArkType for consistency
4. **ArkEnv** for type-safe env vars with custom keywords
5. **JSON Schema** for OpenAPI/interop
6. **`arkenv`** validates at import time (fails fast)
