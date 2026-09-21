import { z } from "zod";

export type Message = {
  id: string;
  senderUsername?: string;
  senderId?: string;
  createdAt: Date;
  imageUrl?: string;
  textContent?: string;
  conversationId: string;
};

export type MessageInput = {
  textContent?: string;
  imageUrl?: string;
};

export const createMessageSchema = z.object({
  textContent: z.string().trim().min(1).max(500).optional(),
  imageUrl: z.url().optional(),
});

export const messageIdSchema = z.object({
  conversationId: z.uuid(),
  messageId: z.uuid(),
});
