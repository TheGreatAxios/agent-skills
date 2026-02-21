# Rule: Zod Ecosystem

## Why It Matters

Zod has a rich ecosystem of integrations, tools, and community resources. Knowing available integrations speeds development and avoids reinventing solutions.

## Official Resources

| Resource | URL |
|----------|-----|
| Documentation | https://zod.dev/ |
| API Reference | https://zod.dev/api |
| Ecosystem | https://zod.dev/ecosystem |
| GitHub | https://github.com/colinhacks/zod |
| Discord | https://discord.gg/zod |

## API Libraries

### tRPC

End-to-end typesafe APIs with Zod validation.

```typescript
import { z } from "zod"
import { initTRPC } from "@trpc/server"

const t = initTRPC.create()

const procedure = t.procedure.input(z.object({
  name: z.string()
}))
```

https://trpc.io

### NestJS Zod

Validate NestJS inputs with Zod.

```typescript
import { ZodValidationPipe } from "nestjs-zod"

@Post()
create(@Body(new ZodValidationPipe(CreateSchema)) body: CreateDto) {
  // body is validated
}
```

https://github.com/risalfajar/nestjs-zod

### Express Zod API

Type-safe Express APIs.

```typescript
import { createMiddleware } from "express-zod-api"

const validate = createMiddleware({
  input: z.object({ id: z.string() }),
  output: z.object({ success: z.boolean() })
})
```

https://github.com/RobinTail/express-zod-api

### oRPC

Type-safe RPC with Zod.

https://orpc.io

## Form Integrations

### React Hook Form

Form validation with Zod schemas.

```typescript
import { zodResolver } from "@hookform/resolvers/zod"

const { register, handleSubmit } = useForm({
  resolver: zodResolver(UserSchema)
})
```

https://react-hook-form.com

### Superforms

SvelteKit form validation.

```typescript
import { zod } from "sveltekit-superforms/adapters"

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(MySchema))
  }
}
```

https://superforms.rocks

### Conform

React form validation.

```typescript
import { getZodConstraint, parseWithZod } from "@conform-to/zod"

const result = parseWithZod(formData, { schema: MySchema })
```

https://conform.guide

## Zod to X

### Zod to OpenAPI

Generate OpenAPI specs from Zod schemas.

```typescript
import { extendApi } from "zod-openapi"

const UserSchema = extendApi(z.object({
  name: z.string().openapi({ example: "John" })
}))
```

https://github.com/asteasolutions/zod-to-openapi

### Prisma Zod Generator

Generate Zod schemas from Prisma models.

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

https://github.com/omar-dulaimi/prisma-zod-generator

### Zod to JSON Schema

Convert Zod to JSON Schema.

```typescript
import { zodToJsonSchema } from "zod-to-json-schema"

const jsonSchema = zodToJsonSchema(MySchema)
```

https://github.com/StefanTerdell/zod-to-json-schema

## X to Zod

### Orval

Generate Zod schemas from OpenAPI.

```typescript
// orval.config.js
module.exports = {
  api: {
    output: {
      mode: "zod"
    }
  }
}
```

https://orval.dev

### Hey API

Generate clients with Zod schemas.

https://heyapi.dev

### Kubb

Generate SDKs with Zod.

https://kubb.dev

## Mocking

### Zod Schema Faker

Generate fake data from Zod schemas.

```typescript
import { zodSchemaFaker } from "zod-schema-faker"

const fake = zodSchemaFaker(UserSchema)
// { name: "John Doe", email: "john@example.com", ... }
```

https://github.com/culars/zod-schema-faker

### Zocker

Mock data generation.

```typescript
import { zocker } from "zocker"

const mock = zocker(UserSchema).generate()
```

https://github.com/dimmerz92/zocker

## Utilities

### Zod Config

Configuration management with Zod.

https://github.com/alloc/zod-config

### ESLint Plugin Zod

Lint rules for Zod usage.

```javascript
// .eslintrc
{
  "plugins": ["zod-x"],
  "rules": {
    "zod-x/prefer-strict": "error"
  }
}
```

https://github.com/Ajatlane/eslint-plugin-zod-x

### Zod Validation Error

Better error messages.

```typescript
import { fromZodError } from "zod-validation-error"

try {
  schema.parse(data)
} catch (error) {
  const friendly = fromZodError(error)
  console.log(friendly.message)
}
```

https://github.com/causaly/zod-validation-error

## Version-Specific Resources

### Zod v4

| Resource | URL |
|----------|-----|
| Changelog | https://zod.dev/v4/changelog |
| Mini Docs | https://zod.dev/packages/mini |
| Core Docs | https://zod.dev/packages/core |
| JSON Schema | https://zod.dev/json-schema |
| Codecs | https://zod.dev/codecs |

### Zod v3

| Resource | URL |
|----------|-----|
| v3 Docs | https://v3.zod.dev |
| Migration Guide | https://zod.dev/v4/migration |

## Community

| Platform | Purpose |
|----------|---------|
| GitHub Issues | Bug reports, feature requests |
| GitHub Discussions | Questions, ideas |
| Discord | Real-time chat |
| Twitter | News and updates |

## Contributing

https://github.com/colinhacks/zod/blob/main/CONTRIBUTING.md

## Tips

1. **Check ecosystem first**: Many integrations already exist
2. **Use form resolvers**: @hookform/resolvers, conform, etc.
3. **Generate from APIs**: Orval/Hey API for client code
4. **Mock with Zod**: Generate test data from schemas
5. **Stay updated**: Watch releases for new features
