import * as uploadeService from "./upload.service.ts"
import type {Request, Response} from "express";

export async function createPresignUpload(req: Request, res: Response){

  const userId = req.user!.id;
  const presignData = req.body;

  const {publicUrl, uploadUrl} = await uploadeService.createPresignUpload(userId, presignData)

  return res.status(201).json({
    status: "success",
    message: "presign upload link created sucessfuly",
    urls: {
      publicUrl,
      uploadUrl,
    }
  });
}
