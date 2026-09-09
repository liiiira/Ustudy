import * as commentController from "./comment.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";
import { validateParams, validateBody } from "../../middlewares/validate";
import { commentInputSchema, postIdSchema } from "./comment.schema";

const router = Router({caseSensitive: true, mergeParams: true});

router.post("/",
  isAuthenticated, 
  validateParams(postIdSchema),
  validateBody(commentInputSchema),
  commentController.create
);


export default router;
