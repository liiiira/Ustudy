import * as uploadRepository from "./upload.repository.ts";
import { createPresignedUrl } from "./storage.ts";
import type {
  PresignType,
  UploadKind,
  UploadContentType,
  Upload,
} from "./upload.schema";
import { randomUUID } from "node:crypto";
import { EXTENSION_BY_TYPE, FOLDER_BY_KIND } from "./upload.schema.ts";
import { AppError } from "../../errors/appError.ts";

const S3_PUBLIC_BASE_URL: string = process.env.S3_PUBLIC_BASE_URL!;
const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

function buildObjectKey(
  ownerId: string,
  kind: UploadKind,
  contentType: UploadContentType,
): string {
  return `${FOLDER_BY_KIND[kind]}/${ownerId}/${randomUUID()}.${EXTENSION_BY_TYPE[contentType]}`;
}

export async function createPresignUpload(
  userId: string,
  presignData: PresignType,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const { kind, contentType, size } = presignData;

  const objectKey: string = buildObjectKey(userId, kind, contentType);
  const uploadUrl = await createPresignedUrl(
    objectKey,
    contentType,
    size,
    UPLOAD_URL_EXPIRY_SECONDS,
  );
  const publicUrl = `${S3_PUBLIC_BASE_URL}/${objectKey}`;

  const upload: Upload | null = await uploadRepository.create(userId, {
    objectKey,
    publicUrl,
    contentType,
    kind,
  });

  if (!upload)
    throw new AppError(
      "Failed to create upload due to unexpected internal error",
      500,
    );

  return { uploadUrl, publicUrl };
}

type UploadUrl =
  | {
      avatarUrl: string;
      postUrl?: never;
      communityUrl?: never;
      conversationUrl?: never;
      messageUrl?: never;
    }
  | {
      postUrl: string;
      avatarUrl?: never;
      communityUrl?: never;
      conversationUrl?: never;
      messageUrl?: never;
    }
  | {
      communityUrl: string;
      avatarUrl?: never;
      postUrl?: never;
      conversationUrl?: never;
      messageUrl?: never;
    }
  | {
      conversationUrl: string;
      avatarUrl?: never;
      postUrl?: never;
      communityUrl?: never;
      messageUrl?: never;
    }
  | {
      messageUrl: string;
      avatarUrl?: never;
      postUrl?: never;
      communityUrl?: never;
      conversationUrl?: never;
    };

export async function verifyUploadOwnerShip(
  requesterId: string,
  uploadUrl: UploadUrl,
): Promise<Upload> {
  const { avatarUrl, postUrl, communityUrl, conversationUrl, messageUrl } =
    uploadUrl;

  const count = [
    avatarUrl,
    postUrl,
    communityUrl,
    conversationUrl,
    messageUrl,
  ].filter(Boolean).length;

  if (count !== 1) {
    throw new AppError(
      "Provide exactly one of avatarUrl, postUrl, communityUrl, conversationUrl, messageUrl",
      400,
    );
  }

  let publicUrl: string;
  let kind: string;

  if (avatarUrl) {
    publicUrl = avatarUrl;
    kind = "avatar";
  }

  if (postUrl) {
    publicUrl = postUrl;
    kind = "post";
  }

  if (communityUrl) {
    publicUrl = communityUrl;
    kind = "community";
  }

  if (conversationUrl) {
    publicUrl = conversationUrl;
    kind = "conversation";
  }

  if (messageUrl) {
    publicUrl = messageUrl;
    kind = "message";
  }

  const upload: Upload | null = await uploadRepository.findByPublicUrl(
    publicUrl!,
  );

  if (!upload) throw new AppError("Upload not found", 404);

  if (upload.ownerId !== requesterId)
    throw new AppError("Not your upload", 403);

  if (upload.kind !== kind!) throw new AppError(`Upload is not ${kind!}`, 403);

  return upload;
}
