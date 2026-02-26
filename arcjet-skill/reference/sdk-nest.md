# SDK NestJS

## Install
`npm i @arcjet/nest`

## Minimal example
```ts
// AppModule
ArcjetModule.forRoot({ key: process.env.ARCJET_KEY!, rules: [] })
```

## Production variant
- Guard-level policies per controller route, shared module defaults, reason-specific exception mapping.

## Links
- https://docs.arcjet.com/reference/nestjs/
- https://blog.arcjet.com/how-to-secure-your-nestjs-application-with-arcjet/
- https://github.com/arcjet/arcjet-js
