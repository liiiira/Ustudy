import { useState } from "react";
import { uploadImage } from "../uploadImage";
import type { UploadKind } from "../uploads.types";

export default function useImageUpload(kind: UploadKind){

  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function upload(file: File): Promise<string | null>{

    setUploading(true);
    setError("");

    try{
      return await uploadImage(file, kind);
    }catch(e){
      if(e instanceof Error)
        setError(e.message);
      return null;
    }finally{
      setUploading(false);
    }
  }

  return {upload, uploading, error};
}
