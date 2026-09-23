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

export type AddMembersBody = {
  memberIds: string[];
};
