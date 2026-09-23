import * as messageController from "./message.controller.ts";
import { Router } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate";
import {
  createMessageSchema,
  findAllMessagesQuerySchema,
} from "./message.schema";
import { conversationIdSchema } from "../conversations/conversation.schema.ts";
import { messageIdSchema } from "./message.schema.ts";

const router = Router({ caseSensitive: true, mergeParams: true });

router.get(
  "/",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateQuery(findAllMessagesQuerySchema),
  messageController.findAllConversation,
);
router.post(
  "/",
  isAuthenticated,
  validateParams(conversationIdSchema),
  validateBody(createMessageSchema),
  messageController.create,
);

router.delete(
  "/:messageId",
  isAuthenticated,
  validateParams(messageIdSchema),
  messageController.deleteById,
);

export default router;
