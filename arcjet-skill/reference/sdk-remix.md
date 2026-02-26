# SDK Remix

## Install
`npm i @arcjet/remix`

## Minimal example
```ts
import arcjet, { shield } from "@arcjet/remix";
const aj = arcjet({ key: process.env.ARCJET_KEY!, rules: [shield({ mode: "LIVE" })] });
```

## Production variant
- Apply in `loader` for GET, `action` for POST/form operations.

## Links
- https://docs.arcjet.com/reference/remix
- https://docs.arcjet.com/shield/reference/
- https://github.com/arcjet/arcjet-js/tree/main/examples/remix
