import type {
  findAllMessagesQueryType,
  Message,
  MessageInput,
} from "./message.schema.ts";
import * as messageService from "./message.service.ts";
import type { Request, Response } from "express";

export async function create(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;
  const requestBody: MessageInput = req.body;

  const createdMessage: Message = await messageService.create(
    userId,
    conversationId,
    requestBody,
  );

  return res.status(201).json({
    status: "success",
    message: "Message Created Sucessfully",
    chatMessage: createdMessage,
  });
}

export async function findAllConversation(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;
  const { limit, cursor } = req.query as unknown as findAllMessagesQueryType;

  const conversationMessages: Message[] =
    await messageService.findAllConversation(userId, {
      conversationId,
      limit,
      cursor,
    });

  return res.status(200).json({
    status: "success",
    message: "Conversation messages found successfully",
    messages: conversationMessages,
  });
}
export async function deleteById(
  req: Request<{ conversationId: string; messageId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId, messageId } = req.params;

  const deletedMessage: { id: string } = await messageService.deleteById(
    userId,
    conversationId,
    messageId,
  );

  return res.status(200).json({
    status: "success",
    message: "Message deleted successfully",
    chatMessage: deletedMessage,
  });
}
