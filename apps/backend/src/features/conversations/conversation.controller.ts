import type { Request, Response } from "express";
import * as conversationService from "./conversation.service.ts";
import type { Conversation, GetConversation } from "./conversation.schema.ts";

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;
  const requestBody = req.body;
  const { created, conversation } =
    await conversationService.createOrFindConversation(userId, requestBody);

  const statusCode = created ? 201 : 200;
  const responseMessage = created
    ? "Conversation created successfuly"
    : "Conversation found successfuly";

  res.status(statusCode).json({
    status: "success",
    message: responseMessage,
    conversation: conversation,
  });
}

export async function getAll(req: Request, res: Response) {
  const userId = req.user!.id;

  const conversations: GetConversation[] =
    await conversationService.getAll(userId);

  return res.status(200).json({
    status: "success",
    message: "Conversations found successfully",
    conversations: conversations,
  });
}

export async function getById(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;

  const conversation: Conversation = await conversationService.getById(
    userId,
    conversationId,
  );

  return res.status(200).json({
    status: "success",
    message: "Conversation found successfully",
    conversation: conversation,
  });
}

export async function updateById(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;
  const requestBody = req.body;

  const updatedConversation: Conversation =
    await conversationService.updateById(userId, conversationId, requestBody);

  return res.status(200).json({
    status: "success",
    message: "Conversation updated successfuly",
    conversation: updatedConversation,
  });
}

export async function deleteById(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;

  const deletedConversation: { id: string } =
    await conversationService.deleteById(userId, conversationId);

  return res.status(200).json({
    status: "success",
    message: "Conversation deleted successfuly",
    conversation: deletedConversation,
  });
}

// Members

export async function addMembers(
  req: Request<{ conversationId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId } = req.params;
  const requestBody = req.body;

  const addedMembers: string[] = await conversationService.addMembers(
    userId,
    conversationId,
    requestBody,
  );

  return res.status(200).json({
    status: "success",
    message: "Members added successfuly",
    members: addedMembers,
  });
}

export async function removeMember(
  req: Request<{ conversationId: string; memberId: string }>,
  res: Response,
) {
  const userId = req.user!.id;
  const { conversationId, memberId } = req.params;

  const removedMember = await conversationService.removeMember(
    userId,
    conversationId,
    memberId,
  );

  return res.status(200).json({
    status: "success",
    message: "Member removed successfuly",
    member: removedMember,
  });
}
