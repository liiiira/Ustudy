import {z} from "zod";

export type DirectConversation = {
  id: string;
  type: string;
  createdAt: Date;
}

export type DirectConversationInput = {
  directKey: string;
  requesterId: string;
  otherUserId: string;
}


export type GroupConversationInput = {
  memberIds: string[];
  name: string;
  imageUrl?: string;
}

export type ConversationUpdate = {
  name?: string;
  imageUrl?: string;
}

export type GroupConversation = {
  id: string;
  type: string;
  name: string;
  ownerId?: string;
  imageUrl?: string;
  createdAt: Date; 
}

export type Conversation = GroupConversation | DirectConversation;

export type CreateDirectConversationInput = {
  otherUserId: string;
  type: "direct";
}

export type CreateGroupConversationInput = {
  memberIds: string[];
  imageUrl?: string;
  type: "group";
  name: string;
}

export type CreateConversationInput = CreateGroupConversationInput | CreateDirectConversationInput;

export type ConversationMember = {
  conversationId: string;
  memberId: string;
  role: "member" | "admin";
  joinedAt: Date;
  lastReadMessageId: string | null;
}

export const createDirectConversationSchema = z.object({
  otherUserId: z.uuid(),
  type: z.literal("direct"), 
});

export const createGroupConversationSchema = z.object({
  memberIds: z.array(z.uuid()),
  type: z.literal("group"),
  name: z.string().min(3).max(100),
  imageUrl: z.url().optional(),
})

export const createConversationSchema = z.discriminatedUnion("type", [
  createDirectConversationSchema,
  createGroupConversationSchema,
]);

export const updateConversationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  imageUrl: z.url().optional(),
});

export const conversationIdSchema = z.object({
  conversationId: z.uuid(),
})


