import { authFetch } from "../../../lib/api";
import type { UploadKind, ContentType } from "../uploads.types";

export async function presignUpload(
  kind: UploadKind,
  contentType: ContentType,
  size: number,
): Promise<{ publicUrl: string; uploadUrl: string }> {
  const data = await authFetch("/uploads/presign", {
    method: "POST",
    body: {
      kind,
      contentType,
      size,
    },
  });

  return data.urls;
}
