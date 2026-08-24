import * as userController from "../controllers/user.controller";
import asyncWrapper from "../utils/asyncWrapper";
import validate from "../middlewares/validate";
import * as UserSchema from '../schemas/user.schema'
import { Router } from "express";

const router = Router({caseSensitive: true});

router.get("/", 
  validate(UserSchema.registerSchema),
  asyncWrapper(userController.getAll)
)
router.post("/", asyncWrapper(userController.create));


export default router;
