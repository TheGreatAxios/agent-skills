# Rule: Instance Validation

## Why It Matters

Instance validation checks if values are instances of specific classes. Use for class instances, DOM elements, built-in objects, and custom class types.

## z.instanceof()

Validate class instances.

```typescript
import { z } from "zod"

// Date instance
const DateSchema = z.instanceof(Date)

DateSchema.parse(new Date()) // ✓
DateSchema.parse("2024-01-01") // ✗ not a Date instance

// Type inference
type DateSchema = z.infer<typeof DateSchema> // Date
```

## Common Built-in Types

```typescript
// Date
const DateInstance = z.instanceof(Date)

// RegExp
const RegexInstance = z.instanceof(RegExp)

// Error
const ErrorInstance = z.instanceof(Error)

// Map
const MapInstance = z.instanceof(Map)

// Set
const SetInstance = z.instanceof(Set)

// ArrayBuffer
const BufferInstance = z.instanceof(ArrayBuffer)
```

## DOM Types

```typescript
// Element
const ElementSchema = z.instanceof(Element)

// HTMLElement
const HtmlElement = z.instanceof(HTMLElement)

// Specific element types
const InputElement = z.instanceof(HTMLInputElement)
const FormElement = z.instanceof(HTMLFormElement)
const CanvasElement = z.instanceof(HTMLCanvasElement)

// Event
const EventSchema = z.instanceof(Event)
const MouseEvent = z.instanceof(MouseEvent)
const KeyboardEvent = z.instanceof(KeyboardEvent)
```

## Custom Classes

```typescript
class User {
  constructor(
    public id: string,
    public name: string
  ) {}
}

class Product {
  constructor(
    public sku: string,
    public price: number
  ) {}
}

const UserInstance = z.instanceof(User)
const ProductInstance = z.instanceof(Product)

// Type inference
type UserInstance = z.infer<typeof UserInstance> // User
```

## Error Messages

```typescript
const DateSchema = z.instanceof(Date, {
  message: "Expected a Date object"
})

// With custom message function
const CustomError = z.instanceof(Date, {
  message: (val) => `Expected Date, got ${val?.constructor?.name ?? typeof val}`
})
```

## Common Patterns

### Event Handlers

```typescript
const EventHandler = z.function()
  .args(z.instanceof(Event))
  .returns(z.void())

// Specific event type
const MouseHandler = z.function()
  .args(z.instanceof(MouseEvent))
  .returns(z.void())
```

### DOM Manipulation

```typescript
const ElementUpdater = z.object({
  element: z.instanceof(HTMLElement),
  update: z.function()
    .args(z.instanceof(HTMLElement))
    .returns(z.void())
})
```

### Error Handling

```typescript
const ErrorResponse = z.object({
  error: z.instanceof(Error),
  timestamp: z.instanceof(Date)
})

// With Error subclass
const ApiError = z.instanceof(TypeError).or(z.instanceof(RangeError))
```

### Data Structures

```typescript
const DataStore = z.object({
  cache: z.instanceof(Map),
  seen: z.instanceof(Set),
  createdAt: z.instanceof(Date)
})
```

## z.property() (v4)

Validate specific property of an object.

```typescript
// v4: Check if object has property with specific type
const HasName = z.property("name", z.string())

// Validates objects with string "name" property
HasName.parse({ name: "test" }) // ✓
HasName.parse({ name: 123 }) // ✗
HasName.parse({ other: "value" }) // ✗
```

## Instanceof vs Custom

```typescript
// instanceof: Class instances only
const DateSchema = z.instanceof(Date)

// custom: More flexible checking
const DateLike = z.custom<Date>((val) => {
  return val instanceof Date ||
    (typeof val === "object" &&
     val !== null &&
     typeof (val as Date).getTime === "function")
}, "Expected Date or Date-like object")
```

## Multiple Instance Types

```typescript
// Union of instance types
const EventOrError = z.union([
  z.instanceof(Event),
  z.instanceof(Error)
])

// Or with .or()
const EventOrErrorAlt = z.instanceof(Event)
  .or(z.instanceof(Error))
```

## Type Inference

```typescript
const Schema = z.instanceof(Date)
type Inferred = z.infer<typeof Schema> // Date

const CustomSchema = z.instanceof(User)
type CustomInferred = z.infer<typeof CustomSchema> // User
```

## Cross-Realm Considerations

```typescript
// instanceof may fail across iframes/workers
// In those cases, use duck typing with z.custom()

const SafeDate = z.custom<Date>((val) => {
  // Works across realms
  return Object.prototype.toString.call(val) === "[object Date]"
}, "Expected Date")
```

## Tips

1. **Use for class instances**: When you need actual instance check
2. **DOM types**: Works with all DOM element types
3. **Consider custom**: For cross-realm or duck typing needs
4. **Error messages**: Customize for better UX
5. **Union for flexibility**: Accept multiple instance types
