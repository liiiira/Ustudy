import * as communityController from "./community.controller.ts";
import { Router } from "express";
import asyncWrapper from "../../utils/asyncWrapper.ts"
import isAuthenticated from "../../middlewares/isAuthenticated.ts";
import {validateBody, validateParams} from "../../middlewares/validate.ts"
import { createCommunitySchema, updateCommunitySchema, idSchema } from "./community.schema.ts";

const router = Router();

router.get("/",
  isAuthenticated,
  asyncWrapper(communityController.findAll)
);

router.get("/:id", 
  isAuthenticated,
  validateParams(idSchema),
  asyncWrapper(communityController.findById)
);

router.post("/", 
  isAuthenticated,
  validateBody(createCommunitySchema),
  asyncWrapper(communityController.create)
);

router.patch("/:id", 
  isAuthenticated,
  validateParams(idSchema),
  validateBody(updateCommunitySchema),
  asyncWrapper(communityController.updateById)
);

router.delete("/:id", 
  isAuthenticated,
  validateParams(idSchema),
  asyncWrapper(communityController.deleteById)
);



export default router;
