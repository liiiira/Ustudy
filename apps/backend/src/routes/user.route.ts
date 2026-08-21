import { handleCreateUser } from "../controllers/user.controller";
import asyncWrapper from "../utils/asyncWrapper";
import { Router } from "express";

const router = Router({caseSensitive: true});

router.post("/", asyncWrapper(handleCreateUser));


export default router;
