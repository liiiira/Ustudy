import { Router } from "express";
import * as authController from '../controllers/auth.controller.ts';
import asyncWrapper from "../utils/asyncWrapper.ts";

const router: Router = Router({caseSensitive: true}); 

router.post("/login", asyncWrapper(authController.login));


export default router;
