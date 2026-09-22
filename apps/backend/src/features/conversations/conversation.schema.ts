import { z } from "zod";

export type DirectConversation = {
  id: string;
  type: string;
  createdAt: Date;
};

export type DirectConversationInput = {
  directKey: string;
  requesterId: string;
  otherUserId: string;
};

export type GroupConversationInput = {
  memberIds: string[];
  name: string;
  imageUrl?: string;
};

export type ConversationUpdate = {
  name?: string;
  imageUrl?: string;
};

export type GroupConversation = {
  id: string;
  type: string;
  name: string;
  ownerId?: string;
  imageUrl?: string;
  createdAt: Date;
};

export type Conversation = GroupConversation | DirectConversation;

export type CreateDirectConversationInput = {
  otherUserId: string;
  type: "direct";
};

export type CreateGroupConversationInput = {
  memberIds: string[];
  imageUrl?: string;
  type: "group";
  name: string;
};

export type CreateConversationInput =
  CreateGroupConversationInput | CreateDirectConversationInput;

export type GetConversation = {
  id: string;
  name: string | null;
  createdAt: Date;
  ownerId: string | null;
  type: "group" | "direct";
  imageUrl: string | null;
  unreadMessagesCount: number;
  lastMessage: null | {
    id: string;
    textContent?: string;
    imageUrl?: string;
    senderUsername?: string;
    createdAt: Date;
  };
};

export type ConversationMember = {
  conversationId: string;
  memberId: string;
  role: "member" | "admin";
  joinedAt: Date;
  lastReadMessageId: string | null;
};

export type AddMembersBody = {
  memberIds: string[];
};

// Read message
export type MarkRead = {
  conversationId: string;
  memberId: string;
  lastReadMessageId: string;
};

export const createDirectConversationSchema = z.object({
  otherUserId: z.uuid(),
  type: z.literal("direct"),
});

export const createGroupConversationSchema = z.object({
  memberIds: z.array(z.uuid()),
  type: z.literal("group"),
  name: z.string().min(3).max(100),
  imageUrl: z.url().optional(),
});

export const createConversationSchema = z.discriminatedUnion("type", [
  createDirectConversationSchema,
  createGroupConversationSchema,
]);

export const updateConversationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  imageUrl: z.url().optional(),
});

export const addMembersSchema = z.object({
  memberIds: z.array(z.uuid()).min(1),
});

// read messages
export const readMessageSchema = z.object({
  messageId: z.uuid(),
});

export const conversationIdSchema = z.object({
  conversationId: z.uuid(),
});

export const conversationMemberIdSchema = z.object({
  conversationId: z.uuid(),
  memberId: z.uuid(),
});
