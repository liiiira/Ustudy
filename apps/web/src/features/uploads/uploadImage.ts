import { presignUpload } from "./api/uploads.api";
import type { ContentType, UploadKind } from "./uploads.types";
import { MAX_UPLOAD_BYTES, CONTENT_TYPES } from "./uploads.types";

export async function uploadImage(file: File, kind: UploadKind){

  if(!CONTENT_TYPES.includes(file.type))
    throw new Error("Unsupported File type, use PNG, JPEG or WebP.");

  if(file.size > MAX_UPLOAD_BYTES)
    throw new Error("File is too large, Maxium size: 5MB.")

  const {uploadUrl, publicUrl} = await presignUpload(kind, file.type as ContentType, file.size);


  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-type": file.type
    }
  });

  if(!putResponse.ok)
    throw new Error("Failed to uplaod image");


  return publicUrl;
}
