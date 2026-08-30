import { Router } from "express";
import * as authController from './auth.controller.ts';
import asyncWrapper from "../../utils/asyncWrapper.ts";
import * as AuthSchema from "./auth.schema.ts"
import { validateBody } from "../../middlewares/validate.ts";

const router: Router = Router({caseSensitive: true}); 

router.post("/login", 
  validateBody(AuthSchema.loginSchema),
  asyncWrapper(authController.login));

router.post("/refresh",
  asyncWrapper(authController.refresh))

router.post("/logout", 
  asyncWrapper(authController.logout))

export default router;
