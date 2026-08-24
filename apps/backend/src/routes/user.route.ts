import * as userController from "../controllers/user.controller";
import asyncWrapper from "../utils/asyncWrapper";
import validate from "../middlewares/validate";
import * as UserSchema from '../schemas/user.schema'
import { Router } from "express";

const router = Router({caseSensitive: true});

router.get("/", 
  asyncWrapper(userController.findAll)
);

router.post("/",
  validate(UserSchema.registerSchema),
  asyncWrapper(userController.create)
);

router.get("/:id/",
  validate(UserSchema.idSchema, "params"), 
  asyncWrapper(userController.findById)
);

export default router;
