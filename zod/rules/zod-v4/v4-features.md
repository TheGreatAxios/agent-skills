# Rule: Zod v4 Features

## Why It Matters

Zod v4 introduces significant performance improvements, new features, and better tree-shaking. Understanding v4-specific features helps you write more efficient schemas.

## Performance Improvements

### 3-10x Faster Parsing

```typescript
// v4 has optimized parsing algorithms
const LargeSchema = z.object({
  // ... many fields
})

// Significantly faster than v3
LargeSchema.parse(data)
```

### Bundle Size Reduction

```typescript
// v4: Up to 70% smaller bundle
// Better tree-shaking with zod/mini

// v3: Full library bundled
// v4: Only what you use
```

## New Features

### .check() Method

```typescript
// v4: Cleaner validation API
const Password = z.string().check((ctx) => {
  if (ctx.value.length < 8) {
    ctx.issues.push({ message: "Too short" })
  }
  if (!/[A-Z]/.test(ctx.value)) {
    ctx.issues.push({ message: "Needs uppercase" })
  }
})
```

### .overwrite() Method

```typescript
// v4: Transform without type change
const Normalized = z.string().overwrite((val) => val.trim().toLowerCase())
```

### z.xor()

```typescript
// v4: Exclusive or
const Exclusive = z.xor(SchemaA, SchemaB)
// Must match exactly one, not both
```

### Message Functions

```typescript
// v4: Dynamic error messages
const Schema = z.string()
  .min(5, (ctx) => `Expected 5+ chars, got ${ctx.value.length}`)
  .max(100, (ctx) => `${ctx.value.length} exceeds limit of 100`)
```

### .safeExtend()

```typescript
// v4: Extend without overwriting
const Base = z.object({ id: z.string() })

const Extended = Base.safeExtend({ name: z.string() }) // OK
// Base.safeExtend({ id: z.string() }) // Error: key exists
```

## Improved Type Inference

```typescript
// v4: Better inference for complex types
const Schema = z.object({
  items: z.array(z.string()),
  meta: z.record(z.unknown())
})

type Inferred = z.infer<typeof Schema>
// More accurate types
```

## Improved Error Handling

### Error Context

```typescript
// v4: Rich error context
const Schema = z.string().min(5, (ctx) => {
  console.log(ctx.value)     // The actual value
  console.log(ctx.minimum)   // The constraint
  return `Value too short`
})
```

### Issue Path

```typescript
// v4: Better path information
const result = schema.safeParse(data)

if (!result.success) {
  for (const issue of result.error.issues) {
    console.log(issue.path)  // Full path to error
    console.log(issue.code)  // Specific error code
  }
}
```

## New String Formats

```typescript
// v4: Additional built-in formats
const Hash = z.string().hash("sha256")
const Jwt = z.string().jwt({ alg: "HS256" })
const Cidr = z.string().cidr({ version: "v4" })
```

## Improved JSON Schema

```typescript
// v4: Better JSON Schema generation
const jsonSchema = z.toJSONSchema(schema, {
  target: "openApi3",
  description: true,
  unrepresentable: "any"
})
```

## Async Improvements

```typescript
// v4: Better async handling
const AsyncSchema = z.string().refine(
  async (val) => {
    const result = await checkValue(val)
    return result.valid
  },
  { message: "Async validation failed" }
)

// Cleaner async API
await AsyncSchema.parseAsync(data)
```

## Comparison: v3 vs v4

| Feature | v3 | v4 |
|---------|----|----|
| Performance | Baseline | 3-10x faster |
| Bundle size | Full | 70% smaller |
| Tree-shaking | Limited | Full support |
| Error context | Basic | Rich |
| Message functions | No | Yes |
| .check() | No | Yes |
| z.xor() | No | Yes |
| zod/mini | No | Yes |
| zod/v4/core | No | Yes |

## Migration Benefits

```typescript
// v3
const Schema = z.object({
  name: z.string()
}).refine(data => data.name.length > 0)

// v4 (same syntax works, faster)
const Schema = z.object({
  name: z.string()
}).refine(data => data.name.length > 0)

// v4 (new features)
const SchemaV4 = z.object({
  name: z.string()
}).check((ctx) => {
  if (ctx.value.name.length === 0) {
    ctx.issues.push({ message: "Required" })
  }
})
```

## Tips

1. **Upgrade for performance**: Significant speed improvements
2. **Use zod/mini for bundles**: Smaller production builds
3. **Adopt .check()**: Cleaner validation syntax
4. **Message functions**: Dynamic error messages
5. **Backwards compatible**: Most v3 code works unchanged
