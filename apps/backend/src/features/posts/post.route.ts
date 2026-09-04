import * as postController from "./post.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated.ts";
import { communityIdSchema, postIdSchema, postInputSchema, postUpdateSchema} from "./post.schema.ts";
import {validateBody, validateParams} from "../../middlewares/validate.ts"
import { is } from "zod/locales";

const router = Router({caseSensitive: true, mergeParams: true});

router.get("/",
  isAuthenticated,
  validateParams(communityIdSchema),
  postController.findAllCommunity
);

router.post("/",
  isAuthenticated,
  validateParams(communityIdSchema),
  validateBody(postInputSchema),
  postController.create
);

router.get("/:postId",
  isAuthenticated,
  validateParams(postIdSchema),
  postController.findById
);

router.patch("/:postId",
  isAuthenticated,
  validateParams(postIdSchema),
  validateBody(postUpdateSchema),
  postController.updateById
);

router.delete("/:postId",
  isAuthenticated,
  validateParams(postIdSchema),
  postController.deleteById
);

export default router;
