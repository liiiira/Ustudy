import { Router } from "express";
import { validateBody } from "../../middlewares/validate";
import { createConversationSchema } from "./conversation.schema";
import isAuthenticated from "../../middlewares/isAuthenticated";
import * as conversationController from "./conversation.controller.ts"

const router = Router({caseSensitive: true, mergeParams: true});


router.post("/",
  isAuthenticated,
  validateBody(createConversationSchema),
  conversationController.create, 
);

export default router;

