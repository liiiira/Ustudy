import * as userController from "./user.controller";
import asyncWrapper from "../../utils/asyncWrapper";
import {validateBody, validateParams } from "../../middlewares/validate";
import * as UserSchema from './user.schema'
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";

const router = Router({caseSensitive: true});

router.get("/", 
  isAuthenticated,
  asyncWrapper(userController.findAll)
);

router.post("/",
  validateBody(UserSchema.registerSchema),
  asyncWrapper(userController.create)
);

router.get("/:id/",
  isAuthenticated,
  validateParams(UserSchema.idSchema, ), 
  asyncWrapper(userController.findById)
);

router.patch("/:id/",
  isAuthenticated,
  validateParams(UserSchema.idSchema),
  validateBody(UserSchema.updateSchema),
  asyncWrapper(userController.updateById)
);

router.delete("/:id/",
  isAuthenticated,
  validateParams(UserSchema.idSchema),
  asyncWrapper(userController.deleteById)
);

export default router;

