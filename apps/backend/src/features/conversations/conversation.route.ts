import { Router } from "express";
import { validateBody, validateParams } from "../../middlewares/validate";
import { addMembersSchema, conversationIdSchema, createConversationSchema, updateConversationSchema } from "./conversation.schema";
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

router.patch("/:conversationId",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateBody(updateConversationSchema),
  conversationController.updateById
);

router.post("/:conversationId/members",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateBody(addMembersSchema),
  conversationController.addMembers
);

export default router;

