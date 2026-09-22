import { Router } from "express";
import { validateBody, validateParams } from "../../middlewares/validate";
import {
  addMembersSchema,
  conversationIdSchema,
  conversationMemberIdSchema,
  createConversationSchema,
  updateConversationSchema,
} from "./conversation.schema";
import isAuthenticated from "../../middlewares/isAuthenticated";
import * as conversationController from "./conversation.controller.ts";

const router = Router({ caseSensitive: true, mergeParams: true });

router.get("/", isAuthenticated, conversationController.getAll);

router.post(
  "/",
  isAuthenticated,
  validateBody(createConversationSchema),
  conversationController.create,
);

router.get(
  "/:conversationId",
  isAuthenticated,
  validateParams(conversationIdSchema),
  conversationController.getById,
);

router.patch(
  "/:conversationId",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateBody(updateConversationSchema),
  conversationController.updateById,
);

router.delete(
  "/:conversationId",
  isAuthenticated,
  validateParams(conversationIdSchema),
  conversationController.deleteById,
);

router.patch(
  "/:conversationId/read",
  isAuthenticated,
  validateParams(conversationIdSchema),
  conversationController.markRead,
);

router.post(
  "/:conversationId/members",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateBody(addMembersSchema),
  conversationController.addMembers,
);

router.delete(
  "/:conversationId/members/:memberId",
  isAuthenticated,
  validateParams(conversationMemberIdSchema),
  conversationController.removeMember,
);

export default router;
