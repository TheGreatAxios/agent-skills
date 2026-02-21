# Rule: v3 to v4 Migration

## Why It Matters

Zod v4 introduces breaking changes alongside new features. Understanding migration requirements ensures smooth upgrades.

## Breaking Changes

### 1. Import Path Changes

```typescript
// v3
import { z } from "zod"

// v4 - Same, but also available:
import * as z from "zod"        // Full library
import * as z from "zod/mini"   // Minimal bundle
import * as zc from "zod/v4/core" // Core utilities
```

### 2. Error Map Changes

```typescript
// v3
z.setErrorMap((issue, ctx) => {
  return { message: "Custom message" }
})

// v4 - Same API, different error codes
// Check issue.code values
```

### 3. Async Refinements

```typescript
// v3
z.string().refine(async (val) => {
  return await checkValue(val)
})

// v4 - Same, but requires parseAsync more strictly
await schema.parseAsync(data)
```

### 4. Custom Schema Changes

```typescript
// v3
z.custom((val) => isValid(val))

// v4
z.custom((val) => isValid(val), { message: "Invalid" })
```

## Deprecations

### z.string().email() etc.

```typescript
// v3 - All methods still work
z.string().email().url().uuid()

// v4 - Same, but some moved to format option
z.string({ format: "email" })  // Alternative
z.string().email()             // Still works
```

### Error Path Format

```typescript
// v3
error.path // ["user", "email"]

// v4 - Same, but improved nested path handling
error.path // Same format
```

## Removed Features

### z.input type (changed behavior)

```typescript
// v3
type Input = z.input<typeof schema>

// v4 - May differ for transforms
// Check z.input vs z.infer carefully
```

## New Features to Adopt

### .check() Method

```typescript
// v3
z.string().superRefine((val, ctx) => {
  if (val.length < 5) {
    ctx.addIssue({ code: "custom", message: "Too short" })
  }
})

// v4 (preferred)
z.string().check((ctx) => {
  if (ctx.value.length < 5) {
    ctx.issues.push({ message: "Too short" })
  }
})
```

### Message Functions

```typescript
// v3
z.string().min(5, "Too short")

// v4 - Also supports functions
z.string().min(5, (ctx) => `Expected 5+, got ${ctx.value.length}`)
```

### z.xor()

```typescript
// v4 new feature
z.xor(SchemaA, SchemaB)
```

### .safeExtend()

```typescript
// v4 new feature
const Extended = Base.safeExtend({ newField: z.string() })
```

## Migration Steps

### 1. Update Dependencies

```bash
npm install zod@latest
# or
pnpm add zod@latest
```

### 2. Run TypeScript Check

```bash
npx tsc --noEmit
```

Look for type errors related to:
- Error map signatures
- Custom schemas
- Async refinements

### 3. Update Error Handling

```typescript
// Check error codes
if (error.code === "invalid_string") {
  // May have different validation field in v4
}
```

### 4. Test Async Code

```typescript
// Ensure async refinements use parseAsync
const result = await schema.parseAsync(data)
```

### 5. Consider zod/mini

```typescript
// For frontend code, switch to mini
import * as z from "zod/mini"

const schema = z.object({
  name: z.string({ min: 1 })
})
```

## Compatibility Layer

```typescript
// v4 provides compatibility for most v3 code
// These just work:

const User = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional()
})

User.parse(data)
User.safeParse(data)
```

## Common Issues

### Issue: "Type instantiation is excessively deep"

```typescript
// v3: May have worked
const HugeSchema = z.object({ /* many fields */ })

// v4: May hit type limits
// Solution: Split into smaller schemas
const Part1 = z.object({ /* ... */ })
const Part2 = z.object({ /* ... */ })
const Combined = Part1.merge(Part2)
```

### Issue: Error codes changed

```typescript
// v3
if (issue.code === "invalid_type") { /* ... */ }

// v4: Same codes, check ZodIssueCode enum
import { ZodIssueCode } from "zod"
if (issue.code === ZodIssueCode.invalid_type) { /* ... */ }
```

### Issue: Bundle size increased

```typescript
// Solution: Use zod/mini for frontend
import * as z from "zod/mini"
```

## Testing Migration

```typescript
// Add tests for all schemas
describe("Schema validation", () => {
  it("validates User schema", () => {
    const result = UserSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects invalid data", () => {
    const result = UserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

## Tips

1. **Read the changelog**: https://zod.dev/v4/changelog
2. **Test thoroughly**: Run all validation tests
3. **Update incrementally**: Migrate module by module
4. **Use TypeScript**: Catches many issues at compile time
5. **Consider mini for frontend**: Smaller bundles
