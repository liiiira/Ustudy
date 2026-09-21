import { z } from "zod";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5Mb

export type UploadContentType = PresignType["contentType"];
export type UploadKind = PresignType["kind"];

export const FOLDER_BY_KIND: Record<UploadKind, string> = {
  avatar: "avatars",
  community: "communities",
  post: "posts",
  conversation: "conversations",
  message: "messages",
} as const;

export const EXTENSION_BY_TYPE: Record<UploadContentType, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export const presignRequestSchema = z.object({
  kind: z.enum(["avatar", "post", "community", "conversation", "message"]),
  contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  size: z.number().positive().max(MAX_UPLOAD_BYTES),
});

export type PresignType = {
  kind: "avatar" | "post" | "community" | "conversation" | "message";
  contentType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
};

export type UploadInput = {
  kind: "avatar" | "post" | "community" | "conversation" | "message";
  objectKey: string;
  publicUrl: string;
  contentType: string;
};

export type Upload = UploadInput & {
  id: string;
  ownerId: string;
  createdAt: Date;
};
