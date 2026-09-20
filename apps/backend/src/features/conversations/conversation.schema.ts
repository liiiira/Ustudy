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

export type GroupConversation = {
  id: string;
  type: string;
  name: string;
  ownerId?: string;
  imageUrl?: string;
  createdAt: Date; 
}

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
