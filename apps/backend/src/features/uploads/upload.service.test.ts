import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.ts";
import type { Upload } from "./upload.schema.ts";

// Mock both of upload.service.ts's real dependencies, no network calls to
// R2, no Postgres. vi.mock factories are hoisted by Vitest above the
// imports below, regardless of source order.
vi.mock("./storage.ts", () => ({
  createPresignedUrl: vi.fn(),
}));

vi.mock("./upload.repository.ts", () => ({
  create: vi.fn(),
}));

// upload.service.ts reads process.env.S3_PUBLIC_BASE_URL at module top level (not
// per-call), so it must be set *before* the module is first imported.
// Static imports are hoisted before any of this file's own code runs, so
// the module under test is imported dynamically, inside beforeAll, after
// the env var is set, not as a static top-level import.
let createPresignUpload: (typeof import("./upload.service.ts"))["createPresignUpload"];
let mockedCreatePresignedUrl: ReturnType<typeof vi.fn>;
let mockedRepoCreate: ReturnType<typeof vi.fn>;

const TEST_S3_BASE_URL = "https://test-bucket.example.com";

beforeAll(async () => {
  process.env.S3_PUBLIC_BASE_URL = TEST_S3_BASE_URL;

  const storage = await import("./storage.ts");
  const uploadRepository = await import("./upload.repository.ts");
  ({ createPresignUpload } = await import("./upload.service.ts"));

  mockedCreatePresignedUrl =
    storage.createPresignedUrl as unknown as ReturnType<typeof vi.fn>;
  mockedRepoCreate = uploadRepository.create as unknown as ReturnType<
    typeof vi.fn
  >;
});

const FAKE_UPLOAD_ROW: Upload = {
  id: "upload-1",
  ownerId: "user-1",
  kind: "avatar",
  objectKey: "avatars/user-1/fake-uuid.png",
  publicUrl: `${TEST_S3_BASE_URL}/avatars/user-1/fake-uuid.png`,
  contentType: "image/png",
  createdAt: new Date(),
};

describe("upload.service.createPresignUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds an object key namespaced by kind/owner and requests a presigned URL for it", async () => {
    mockedCreatePresignedUrl.mockResolvedValue(
      "https://s3.example.com/signed-put-url",
    );
    mockedRepoCreate.mockResolvedValue(FAKE_UPLOAD_ROW);

    const result = await createPresignUpload("user-1", {
      kind: "avatar",
      contentType: "image/png",
      size: 1024,
    });

    expect(mockedCreatePresignedUrl).toHaveBeenCalledTimes(1);
    const [calledKey, calledContentType, calledSize, calledExpiry] =
      mockedCreatePresignedUrl.mock.calls[0];

    expect(calledKey).toMatch(/^avatars\/user-1\/[0-9a-f-]+\.png$/);
    expect(calledContentType).toBe("image/png");
    expect(calledSize).toBe(1024); // signed into the URL so R2 enforces it, see agent-logs/r2-image-integration-plan.md
    expect(calledExpiry).toBe(5 * 60); // 5 minutes, per the plan

    expect(result).toEqual({
      uploadUrl: "https://s3.example.com/signed-put-url",
      publicUrl: `${TEST_S3_BASE_URL}/${calledKey}`,
    });
  });

  it("maps each kind to its own folder prefix", async () => {
    mockedCreatePresignedUrl.mockResolvedValue(
      "https://s3.example.com/signed-put-url",
    );
    mockedRepoCreate.mockResolvedValue(FAKE_UPLOAD_ROW);

    await createPresignUpload("user-1", {
      kind: "post",
      contentType: "image/webp",
      size: 2048,
    });
    const [postKey] = mockedCreatePresignedUrl.mock.calls[0];
    expect(postKey).toMatch(/^posts\/user-1\//);

    vi.clearAllMocks();
    mockedCreatePresignedUrl.mockResolvedValue(
      "https://s3.example.com/signed-put-url",
    );
    mockedRepoCreate.mockResolvedValue(FAKE_UPLOAD_ROW);

    await createPresignUpload("user-1", {
      kind: "community",
      contentType: "image/webp",
      size: 2048,
    });
    const [communityKey] = mockedCreatePresignedUrl.mock.calls[0];
    expect(communityKey).toMatch(/^communities\/user-1\//);
  });

  it("persists an uploads row with the requesting user as owner before returning", async () => {
    mockedCreatePresignedUrl.mockResolvedValue(
      "https://s3.example.com/signed-put-url",
    );
    mockedRepoCreate.mockResolvedValue(FAKE_UPLOAD_ROW);

    await createPresignUpload("user-1", {
      kind: "avatar",
      contentType: "image/png",
      size: 1024,
    });

    expect(mockedRepoCreate).toHaveBeenCalledTimes(1);
    expect(mockedRepoCreate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        kind: "avatar",
        contentType: "image/png",
        objectKey: expect.stringMatching(/^avatars\/user-1\//),
        publicUrl: expect.stringContaining("avatars/user-1/"),
      }),
    );
  });

  it("throws a 500 AppError if the repository fails to persist the upload record", async () => {
    mockedCreatePresignedUrl.mockResolvedValue(
      "https://s3.example.com/signed-put-url",
    );
    mockedRepoCreate.mockResolvedValue(null);

    await expect(
      createPresignUpload("user-1", {
        kind: "avatar",
        contentType: "image/png",
        size: 1024,
      }),
    ).rejects.toThrow(AppError);

    await expect(
      createPresignUpload("user-1", {
        kind: "avatar",
        contentType: "image/png",
        size: 1024,
      }),
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("propagates a storage-layer failure and never persists a row for it", async () => {
    mockedCreatePresignedUrl.mockRejectedValue(new Error("S3 unreachable"));

    await expect(
      createPresignUpload("user-1", {
        kind: "avatar",
        contentType: "image/png",
        size: 1024,
      }),
    ).rejects.toThrow("S3 unreachable");

    expect(mockedRepoCreate).not.toHaveBeenCalled();
  });
});
