import * as userController from "./user.controller";
import asyncWrapper from "../../utils/asyncWrapper";
import {validateBody, validateParams } from "../../middlewares/validate";
import * as UserSchema from './user.schema'
import { Router } from "express";

const router = Router({caseSensitive: true});

router.get("/", 
  asyncWrapper(userController.findAll)
);

router.post("/",
  validateBody(UserSchema.registerSchema),
  asyncWrapper(userController.create)
);

router.get("/:id/",
  validateParams(UserSchema.idSchema, ), 
  asyncWrapper(userController.findById)
);

router.patch("/:id/",
  validateParams(UserSchema.idSchema),
  validateBody(UserSchema.updateSchema),
  asyncWrapper(userController.updateById)
);

router.delete("/:id/",
  validateParams(UserSchema.idSchema),
  asyncWrapper(userController.deleteById)
);

export default router;

