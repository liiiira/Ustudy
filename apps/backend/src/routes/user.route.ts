import * as userController from "../controllers/user.controller";
import asyncWrapper from "../utils/asyncWrapper";
import { Router } from "express";

const router = Router({caseSensitive: true});

router.get("/", asyncWrapper(userController.getAll))
router.post("/", asyncWrapper(userController.create));


export default router;
