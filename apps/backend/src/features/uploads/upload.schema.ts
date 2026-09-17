import {z} from "zod";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5Mb 

export type UploadContentType =  PresignType["contentType"]
export type UploadKind =  PresignType["kind"]

export const FOLDER_BY_KIND: Record<UploadKind, string> = {
  "avatar": "avatars",
  "community": "communities",
  "post": "posts",
} as const;

export const EXTENSION_BY_TYPE: Record<UploadContentType, string> = {
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export const presignRequestSchema = z.object({
  kind: z.enum(["avatar", "post", "community"]),
  contentType: z.enum(["image/png", "image/jpg", "image/webp"]),
  size: z.number().positive().max(MAX_UPLOAD_BYTES),
});

export type PresignType = {
  kind: "avatar" | "post" | "community";
  contentType: "image/png" | "image/jpg" | "image/webp";
  size: number;
}

export type UploadInput = {
  kind: "avatar" | "post" | "community";
  objectKey: string;
  publicUrl: string;
  contentType: string;
}

export type Upload = UploadInput & {
  id: string;   
  ownerId: string;       
  createdAt: Date;  
}
