import { describe, it, expect } from "vitest";
import { presignRequestSchema } from "./upload.schema.ts";

describe("presignRequestSchema", () => {
  it("accepts a well-formed presign request", () => {
    const result = presignRequestSchema.safeParse({
      kind: "avatar",
      contentType: "image/png",
      size: 1024,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown kind", () => {
    const result = presignRequestSchema.safeParse({
      kind: "banner",
      contentType: "image/png",
      size: 1024,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a content type outside the allowlist", () => {
    const result = presignRequestSchema.safeParse({
      kind: "avatar",
      contentType: "image/gif",
      size: 1024,
    });

    expect(result.success).toBe(false);
  });

  it("accepts the standard 'image/jpeg' MIME type", () => {
    const result = presignRequestSchema.safeParse({
      kind: "avatar",
      contentType: "image/jpeg",
      size: 1024,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a size over the 5MB limit", () => {
    const result = presignRequestSchema.safeParse({
      kind: "avatar",
      contentType: "image/png",
      size: 6 * 1024 * 1024,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a zero or negative size", () => {
    expect(
      presignRequestSchema.safeParse({
        kind: "avatar",
        contentType: "image/png",
        size: 0,
      }).success,
    ).toBe(false);

    expect(
      presignRequestSchema.safeParse({
        kind: "avatar",
        contentType: "image/png",
        size: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects a request missing a required field", () => {
    const result = presignRequestSchema.safeParse({
      kind: "avatar",
      size: 1024,
    });

    expect(result.success).toBe(false);
  });
});
