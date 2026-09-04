import * as postController from "./post.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated.ts";
import { communityIdSchema, postInputSchema } from "./post.schema.ts";
import {validateBody, validateParams} from "../../middlewares/validate.ts"

const router = Router({caseSensitive: true, mergeParams: true});

router.post("/",
  isAuthenticated,
  validateParams(communityIdSchema),
  validateBody(postInputSchema),
  postController.create
);


export default router;
