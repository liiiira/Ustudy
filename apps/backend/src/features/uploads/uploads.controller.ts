import * as uplodesService from "./upload.service.ts"
import type {Request, Response} from "express";

export async function createPresignUpload(req: Request, res: Response){
  const userId = req.user!.id;
  const presignData = req.body;
  const {publicUrl, uploadUrl} = await uplodesService.createPresignUpload(userId, presignData)
  return res.status(201).json({
    status: "sucess",
    message: "presign upload link created sucessfuly",
    urls: {
      publicUrl,
      uploadUrl,
    }
  });
}
