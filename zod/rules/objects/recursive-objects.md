# Rule: Recursive Objects

## Why It Matters

Self-referential types like trees, linked lists, and nested comments require special handling in Zod. The `z.lazy()` function enables recursive schema definitions.

## Basic Recursive Schema

```typescript
import { z } from "zod"

// Category with nested subcategories
const Category: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(Category).optional()
  })
)

interface Category {
  name: string
  subcategories?: Category[]
}
```

## z.lazy()

Wraps a schema in a function, deferring evaluation until runtime.

```typescript
// Syntax
z.lazy(() => Schema)

// The callback is called when the schema is first used
```

## Common Recursive Patterns

### Tree Structure

```typescript
type TreeNode = {
  value: string
  left?: TreeNode
  right?: TreeNode
}

const TreeNode: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    left: TreeNode.optional(),
    right: TreeNode.optional()
  })
)

// Parse tree data
const tree = TreeNode.parse({
  value: "root",
  left: { value: "left" },
  right: { value: "right", left: { value: "right-left" } }
})
```

### Nested Comments

```typescript
type Comment = {
  id: string
  text: string
  author: string
  replies: Comment[]
}

const Comment: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    text: z.string(),
    author: z.string(),
    replies: z.array(Comment).default([])
  })
)
```

### File System

```typescript
type FileSystem = {
  name: string
  type: "file" | "folder"
  size?: number
  children?: FileSystem[]
}

const FileSystem: z.ZodType<FileSystem> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(["file", "folder"]),
    size: z.number().optional(),
    children: z.array(FileSystem).optional()
  })
)
```

### JSON Value

```typescript
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const JsonValue: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValue),
    z.record(JsonValue)
  ])
)
```

### Menu Structure

```typescript
type MenuItem = {
  label: string
  href?: string
  children?: MenuItem[]
}

const MenuItem: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    href: z.string().optional(),
    children: z.array(MenuItem).optional()
  })
)
```

## Mutual Recursion

Multiple types that reference each other.

```typescript
type Author = {
  name: string
  posts: Post[]
}

type Post = {
  title: string
  author: Author
}

// Must declare types first, then define schemas
const Author: z.ZodType<Author> = z.lazy(() =>
  z.object({
    name: z.string(),
    posts: z.array(Post)
  })
)

const Post: z.ZodType<Post> = z.lazy(() =>
  z.object({
    title: z.string(),
    author: Author
  })
)
```

## Using z.discriminatedUnion with Recursion

```typescript
type Node =
  | { type: "value"; value: number }
  | { type: "add"; left: Node; right: Node }
  | { type: "multiply"; left: Node; right: Node }

const Node: z.ZodType<Node> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("value"),
      value: z.number()
    }),
    z.object({
      type: z.literal("add"),
      left: Node,
      right: Node
    }),
    z.object({
      type: z.literal("multiply"),
      left: Node,
      right: Node
    })
  ])
)

// Parse expression tree
const expr = Node.parse({
  type: "add",
  left: { type: "value", value: 1 },
  right: {
    type: "multiply",
    left: { type: "value", value: 2 },
    right: { type: "value", value: 3 }
  }
})
```

## Validation Depth

Zod has a maximum recursion depth to prevent stack overflows.

```typescript
// Deep nesting may hit recursion limits
const deeplyNested = {
  value: "root",
  children: [{
    value: "level1",
    children: [{
      value: "level2",
      children: [/* ... very deep ... */]
    }]
  }]
}

// May throw if too deep
```

### Handling Deep Structures

```typescript
// Use iterative approach for very deep structures
function validateWithDepthLimit(data: unknown, maxDepth = 100): boolean {
  let depth = 0

  function traverse(node: unknown): boolean {
    if (depth > maxDepth) return false
    depth++

    try {
      const result = TreeNode.safeParse(node)
      if (!result.success) return false

      const children = result.data.children || []
      return children.every(traverse)
    } finally {
      depth--
    }
  }

  return traverse(data)
}
```

## Transform Recursive Data

```typescript
// Count all nodes in tree
const CountNodes = TreeNode.transform(function count(node, ctx) {
  let total = 1
  if (node.left) total += count(node.left, ctx)
  if (node.right) total += count(node.right, ctx)
  return total
})
```

## Common Patterns

### HTML-like Structure

```typescript
type Element = {
  tag: string
  attributes?: Record<string, string>
  children?: (Element | string)[]
}

const Element: z.ZodType<Element> = z.lazy(() =>
  z.object({
    tag: z.string(),
    attributes: z.record(z.string()).optional(),
    children: z.array(z.union([Element, z.string()])).optional()
  })
)
```

### Organization Hierarchy

```typescript
type Department = {
  id: string
  name: string
  manager?: string
  subdepartments: Department[]
}

const Department: z.ZodType<Department> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    manager: z.string().optional(),
    subdepartments: z.array(Department).default([])
  })
)
```

## Type Inference

Recursive schemas require explicit TypeScript type annotations:

```typescript
// Must declare type
type Tree = {
  value: string
  children?: Tree[]
}

// And annotate the schema
const Tree: z.ZodType<Tree> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(Tree).optional()
  })
)

// Then inference works
type InferredTree = z.infer<typeof Tree> // Tree
```

## Tips

1. **Always annotate type**: TypeScript needs explicit type for recursive schemas
2. **Use z.lazy()**: Wraps schema to defer evaluation
3. **Consider depth limits**: Very deep structures may cause issues
4. **Mutual recursion works**: Declare types first, then schemas
5. **Discriminated unions**: Combine with lazy for expression trees
