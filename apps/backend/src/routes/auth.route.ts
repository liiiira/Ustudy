import { Router } from "express";
import * as authController from '../controllers/auth.controller.ts';
import asyncWrapper from "../utils/asyncWrapper.ts";

const router: Router = Router({caseSensitive: true}); 

router.post("/login", asyncWrapper(authController.login));
router.post("/refresh", asyncWrapper(authController.refresh))

export default router;
