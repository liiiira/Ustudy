export type UploadKind = "post" | "avatar" | "community" | "conversation" | "message";
export type ContentType = "image/jpeg" | "image/webp" | "image/png";

export const CONTENT_TYPES = ["image/jpeg", "image/webp", "image/png"]
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
