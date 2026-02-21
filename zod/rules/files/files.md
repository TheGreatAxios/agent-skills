# Rule: File Validation

## Why It Matters

File validation handles file uploads in web applications. Use for form uploads, drag-and-drop interfaces, and API endpoints accepting multipart data.

## z.file()

Validate File objects (browser File API).

```typescript
import { z } from "zod"

// Basic file validation
const FileUpload = z.file()

FileUpload.parse(new File(["content"], "test.txt"))
// ✓ File object
```

## File Constraints

### Type/Extension

```typescript
// Specific file type
const ImageUpload = z.file()
  .type("image/jpeg", "Must be a JPEG image")

// Multiple allowed types
const ImageOrPng = z.file()
  .type(["image/jpeg", "image/png"])

// MIME type patterns
const AnyImage = z.file()
  .type(/^image\//, "Must be an image")
```

### Size Constraints

```typescript
// Maximum size
const LimitedFile = z.file()
  .max(5 * 1024 * 1024, "File must be less than 5MB")

// Minimum size (prevent empty files)
const NonEmptyFile = z.file()
  .min(1, "File cannot be empty")

// Exact size range
const BoundedFile = z.file()
  .min(1024, "Minimum 1KB")
  .max(10 * 1024 * 1024, "Maximum 10MB")
```

## Common Patterns

### Image Upload

```typescript
const ImageUpload = z.file()
  .type(["image/jpeg", "image/png", "image/webp"])
  .max(5 * 1024 * 1024, "Image must be less than 5MB")

// In form schema
const AvatarForm = z.object({
  avatar: ImageUpload,
  alt: z.string().optional()
})
```

### Document Upload

```typescript
const DocumentUpload = z.file()
  .type([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ])
  .max(25 * 1024 * 1024, "Document must be less than 25MB")

const DocumentForm = z.object({
  document: DocumentUpload,
  title: z.string(),
  description: z.string().optional()
})
```

### Multiple Files

```typescript
const MultipleFiles = z.array(z.file())
  .min(1, "Select at least one file")
  .max(5, "Maximum 5 files")

// With individual constraints
const ImageGallery = z.array(
  z.file()
    .type(/^image\//)
    .max(10 * 1024 * 1024)
)
.min(1)
.max(10)
```

### Avatar Upload

```typescript
const AvatarUpload = z.file()
  .type(["image/jpeg", "image/png"])
  .min(1024, "Image too small")
  .max(2 * 1024 * 1024, "Maximum 2MB")

// Transform to base64
const AvatarBase64 = AvatarUpload.transform(async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
})
```

### Video Upload

```typescript
const VideoUpload = z.file()
  .type(["video/mp4", "video/webm", "video/ogg"])
  .max(500 * 1024 * 1024, "Video must be less than 500MB")
```

### CSV Upload

```typescript
const CsvUpload = z.file()
  .type("text/csv")
  .max(10 * 1024 * 1024)

// Parse CSV content
const ParsedCsv = CsvUpload.transform(async (file) => {
  const text = await file.text()
  return text.split("\n").map(row => row.split(","))
})
```

## File Properties

Access file properties in refinements:

```typescript
const NamedFile = z.file()
  .refine(
    (file) => file.name.length > 0,
    { message: "File must have a name" }
  )
  .refine(
    (file) => file.name.endsWith(".pdf"),
    { message: "File must be a PDF" }
  )

// Available properties:
// - file.name: string
// - file.size: number (bytes)
// - file.type: string (MIME type)
// - file.lastModified: number
```

## Custom Validation

```typescript
const CustomFile = z.file()
  .refine(
    (file) => file.size > 0,
    { message: "File is empty" }
  )
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    { message: "File too large (max 10MB)" }
  )
  .refine(
    (file) => ["image/jpeg", "image/png"].includes(file.type),
    { message: "Only JPEG and PNG allowed" }
  )
  .refine(
    (file) => file.name.length <= 255,
    { message: "Filename too long" }
  )
```

## Error Messages

```typescript
const FileWithMessages = z.file({
  required_error: "Please select a file",
  invalid_type_error: "Expected a file"
})
.type("image/png", "Must be a PNG image")
.max(1024 * 1024, { message: "Maximum 1MB" })
```

## Server-Side Considerations

```typescript
// In Node.js with formidable/multer
// File objects may be different - use custom schema

const ServerFile = z.custom<File>((val) => {
  // Check for multer file object
  return (
    typeof val === "object" &&
    val !== null &&
    "fieldname" in val &&
    "originalname" in val &&
    "size" in val &&
    "mimetype" in val
  )
}, "Invalid file upload")

// With size validation
const ValidatedFile = ServerFile.refine(
  (file) => file.size <= 5 * 1024 * 1024,
  { message: "File too large" }
)
```

## Type Inference

```typescript
const FileSchema = z.file()

type FileSchema = z.infer<typeof FileSchema> // File

const OptionalFile = z.file().optional()
type OptionalFile = z.infer<typeof OptionalFile> // File | undefined
```

## Tips

1. **Use MIME types**: More reliable than extensions
2. **Set reasonable limits**: Prevent DoS with large files
3. **Client-side hints**: Validate before upload when possible
4. **Server validation required**: Client validation can be bypassed
5. **Consider streaming**: For large files, don't load into memory
