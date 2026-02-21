# Rule: Internationalization (i18n)

## Why It Matters

Zod supports internationalized error messages. Use for applications with multiple locales and non-English users.

## Built-in Locales

```typescript
import { z } from "zod"
import { en, de, fr, es, ja, zh } from "zod/locales"

// Set global locale
z.setErrorMap(en)
z.setErrorMap(de)
z.setErrorMap(fr)
```

## Available Locales

| Locale | Code |
|--------|------|
| English | `en` |
| German | `de` |
| French | `fr` |
| Spanish | `es` |
| Japanese | `ja` |
| Chinese | `zh` |
| Portuguese | `pt` |
| Russian | `ru` |
| Korean | `ko` |
| Italian | `it` |
| Dutch | `nl` |
| Arabic | `ar` |

## Setting Locale

### Global

```typescript
import { z } from "zod"
import { de } from "zod/locales"

// Set German globally
z.setErrorMap(de)

const schema = z.string().email()
schema.parse("invalid")
// Error: "Ungültige E-Mail-Adresse"
```

### Per-Schema

```typescript
import { de } from "zod/locales"

const GermanSchema = z.string().min(5).errorMap(de)
```

### Per-Parse

```typescript
import { de } from "zod/locales"

const result = schema.safeParse(data, {
  errorMap: de
})
```

## Custom Locale

Create custom error map for your language:

```typescript
import { z } from "zod"

const customLocale: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === "string") {
        return { message: "Wert muss ein Text sein" }
      }
      break
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: `Text muss mindestens ${issue.minimum} Zeichen haben` }
      }
      break
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "Ungültige E-Mail-Adresse" }
      }
      break
  }
  return { message: ctx.defaultError }
}

z.setErrorMap(customLocale)
```

## Common Patterns

### Request-Based Locale

```typescript
import { en, de, fr } from "zod/locales"

const locales: Record<string, z.ZodErrorMap> = {
  en,
  de,
  fr
}

app.post("/api/users", (req, res) => {
  const locale = req.headers["accept-language"]?.split(",")[0] || "en"
  const errorMap = locales[locale] || en

  const result = UserSchema.safeParse(req.body, { errorMap })

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.errors.map(e => e.message)
    })
  }

  // ...
})
```

### User Preference Locale

```typescript
function validateWithLocale<T>(
  schema: z.ZodType<T>,
  data: unknown,
  userLocale: string
) {
  const errorMap = getErrorMap(userLocale)
  return schema.safeParse(data, { errorMap })
}

function getErrorMap(locale: string): z.ZodErrorMap {
  const maps: Record<string, z.ZodErrorMap> = {
    en: enErrorMap,
    de: deErrorMap,
    // ...
  }
  return maps[locale] || maps.en
}
```

### Fallback Chain

```typescript
function getErrorMapWithFallback(
  preferredLocale: string,
  fallbackLocale: string = "en"
): z.ZodErrorMap {
  return (issue, ctx) => {
    const preferred = localeMaps[preferredLocale]
    const result = preferred?.(issue, ctx)

    if (result?.message) return result

    const fallback = localeMaps[fallbackLocale]
    return fallback?.(issue, ctx) || { message: ctx.defaultError }
  }
}
```

## Custom Messages with i18n

```typescript
const messages = {
  en: {
    emailInvalid: "Please enter a valid email",
    passwordTooShort: "Password must be at least 8 characters"
  },
  de: {
    emailInvalid: "Bitte geben Sie eine gültige E-Mail ein",
    passwordTooShort: "Passwort muss mindestens 8 Zeichen haben"
  }
}

function createSchema(locale: "en" | "de") {
  const t = messages[locale]

  return z.object({
    email: z.string().email(t.emailInvalid),
    password: z.string().min(8, t.passwordTooShort)
  })
}
```

## Error Map Structure

```typescript
interface ZodErrorMap {
  (issue: ZodIssue, ctx: { defaultError: string }): { message: string }
}

// Issue types to handle
enum ZodIssueCode {
  invalid_type,
  invalid_literal,
  custom,
  invalid_union,
  invalid_enum_value,
  unrecognized_keys,
  invalid_arguments,
  invalid_return_type,
  invalid_date,
  invalid_string,
  too_small,
  too_big,
  invalid_intersection_types,
  not_multiple_of,
  not_finite
}
```

## Partial Locale Override

```typescript
import { en } from "zod/locales"

const customEnglish: z.ZodErrorMap = (issue, ctx) => {
  // Override specific messages
  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === "email") {
      return { message: "Please enter a valid email address" }
    }
  }

  // Fall back to base locale
  return en(issue, ctx)
}
```

## Tips

1. **Use per-parse errorMap**: For request-based locale switching
2. **Create custom maps**: For full control over messages
3. **Fallback to English**: Always have a fallback locale
4. **Cache error maps**: Avoid recreating for each request
5. **Test all locales**: Ensure translations are complete
