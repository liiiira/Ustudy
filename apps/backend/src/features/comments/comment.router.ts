import * as commentController from "./comment.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";
import { validateParams, validateBody } from "../../middlewares/validate";
import { commentIdSchema, commentInputSchema, postIdSchema, commentUpdateSchema } from "./comment.schema";

const router = Router({caseSensitive: true, mergeParams: true});

router.post("/",
  isAuthenticated, 
  validateParams(postIdSchema),
  validateBody(commentInputSchema),
  commentController.create
);

router.get("/",
  isAuthenticated,
  validateParams(postIdSchema),
  commentController.findAllPost
);

router.patch("/:commentId",
  isAuthenticated,
  validateParams(commentIdSchema),
  validateBody(commentUpdateSchema),
  commentController.updateById
)
export default router;
