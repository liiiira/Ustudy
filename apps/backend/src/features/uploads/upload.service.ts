import * as uploadRepository from "./upload.repository.ts";
import { createPresignedUrl } from "./storage.ts";
import type { PresignType, UploadKind, UploadContentType, Upload} from "./upload.schema";
import { randomUUID } from "node:crypto";
import {EXTENSION_BY_TYPE, FOLDER_BY_KIND} from "./upload.schema.ts"
import { AppError } from "../../errors/appError.ts";

const S3_PUBLIC_BASE_URL: string = process.env.S3_BASE_URL!;
const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

function buildObjectKey(ownerId: string, kind: UploadKind, contentType: UploadContentType): string{
    return `${FOLDER_BY_KIND[kind]}/${ownerId}/${randomUUID()}.${EXTENSION_BY_TYPE[contentType]}`;
}

export async function createPresignUpload(userId: string, presignData: PresignType): Promise<{uploadUrl: string, publicUrl: string}>{

  const {kind, contentType, size} = presignData;
  
  const objectKey: string = buildObjectKey(userId, kind, contentType);
  const uploadUrl = await createPresignedUrl(objectKey, contentType, size, UPLOAD_URL_EXPIRY_SECONDS)
  const publicUrl = `${S3_PUBLIC_BASE_URL}/${objectKey}`;

  const upload: Upload | null = await uploadRepository.create(userId, {objectKey, publicUrl, contentType, kind})
  
  if(!upload)
    throw new AppError("Failed to create upload due to unexpected internal error", 500);

  return {uploadUrl, publicUrl};

}
