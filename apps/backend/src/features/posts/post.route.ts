import * as postController from "./post.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated.ts";
import { communityIdSchema, postIdSchema, postInputSchema } from "./post.schema.ts";
import {validateBody, validateParams} from "../../middlewares/validate.ts"

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



export default router;
