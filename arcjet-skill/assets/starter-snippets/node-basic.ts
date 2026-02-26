import arcjet, { shield } from "@arcjet/node";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "DRY_RUN" })],
});

export async function protectOrThrow(request: Request) {
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    throw new Error("Arcjet denied request");
  }
}
