import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";
import { validateBody } from "../../middlewares/validate";
import { presignRequestSchema } from "./upload.schema";
import * as uploadsController from "./uploads.controller.ts";

const router = Router({ mergeParams: true, caseSensitive: true });

router.post(
  "/presign",
  isAuthenticated,
  validateBody(presignRequestSchema),
  uploadsController.createPresignUpload,
);

export default router;
