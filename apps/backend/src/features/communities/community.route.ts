import * as communityController from "./community.controller.ts";
import { Router } from "express";
import asyncWrapper from "../../utils/asyncWrapper.ts"
import isAuthenticated from "../../middlewares/isAuthenticated.ts";
import {validateBody} from "../../middlewares/validate.ts"
import { createCommunitySchema } from "./community.schema.ts";

const router = Router();

router.post("/", 
  isAuthenticated,
  validateBody(createCommunitySchema),
  asyncWrapper(communityController.create)
);


export default router;
