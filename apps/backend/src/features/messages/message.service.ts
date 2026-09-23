import * as messageRepository from "./message.repository.ts";
import * as uploadService from "../uploads/upload.service.ts";
import * as conversationService from "../conversations/conversation.service.ts";
import type {
  ConversationMessagesInput,
  Message,
  MessageInput,
} from "./message.schema.ts";
import { AppError } from "../../errors/appError.ts";
import type {
  Conversation,
  ConversationMember,
} from "../conversations/conversation.schema.ts";

export async function create(
  requesterId: string,
  conversationId: string,
  { textContent, imageUrl }: MessageInput,
): Promise<Message> {
  if (!textContent && !imageUrl)
    throw new AppError("Message must contain at least a text or an image", 400);

  const conversation = await conversationService.findById(conversationId);
  if (!conversation) throw new AppError("Conversation Not found", 404);

  const requesterMember = await conversationService.findMember(
    conversationId,
    requesterId,
  );
  if (!requesterMember)
    throw new AppError("Not a member of this conversation", 403);

  let uploadId: string | undefined;
  if (imageUrl) {
    const upload = await uploadService.verifyUploadOwnerShip(requesterId, {
      messageUrl: imageUrl,
    });
    uploadId = upload.id;
  }

  const createdMessage: Message | null = await messageRepository.create({
    conversationId,
    senderId: requesterId,
    textContent,
    uploadId,
  });
  if (!createdMessage)
    throw new AppError(
      "Failed to create message due to unnexpected error",
      500,
    );

  return createdMessage;
}

export async function findById(
  conversationId: string,
  messageId: string,
): Promise<Message | null> {
  return messageRepository.findById(conversationId, messageId);
}

export async function findAllConversation(
  requesterId: string,
  { conversationId, limit, cursor }: ConversationMessagesInput,
): Promise<Message[]> {
  const conversation: Conversation | null =
    await conversationService.findById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", 404);

  const requesterMember: ConversationMember | null =
    await conversationService.findMember(conversationId, requesterId);
  if (!requesterMember)
    throw new AppError("Not a member of this conversation", 403);

  return messageRepository.findAllConversation(conversationId, limit, cursor);
}

export async function deleteById(
  requesterId: string,
  conversationId: string,
  messageId: string,
): Promise<{ id: string }> {
  const conversation = await conversationService.findById(conversationId);
  if (!conversation) throw new AppError("Conversation Not found", 404);

  const requesterMember: ConversationMember | null =
    await conversationService.findMember(conversationId, requesterId);
  if (!requesterMember)
    throw new AppError("You are a not a member of this conversation", 403);

  const message: Message | null = await findById(conversationId, messageId);
  if (!message) throw new AppError("Message not found", 404);

  if (requesterMember.role !== "admin" && message.senderId !== requesterId)
    throw new AppError("You are not allowed to delete this message", 403);

  const result = await messageRepository.deleteById(conversationId, messageId);
  if (!result)
    throw new AppError("Failed to delete message due to unexpected error", 500);

  return result;
}
