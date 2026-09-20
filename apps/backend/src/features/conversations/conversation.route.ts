import { Router } from "express";
import { validateBody, validateParams } from "../../middlewares/validate";
import { conversationIdSchema, createConversationSchema } from "./conversation.schema";
import isAuthenticated from "../../middlewares/isAuthenticated";
import * as conversationController from "./conversation.controller.ts"

const router = Router({caseSensitive: true, mergeParams: true});


router.post("/",
  isAuthenticated,
  validateBody(createConversationSchema),
  conversationController.create
);

router.get("/:conversationId", 
  isAuthenticated,
  validateParams(conversationIdSchema),
  conversationController.getById
);


export default router;

