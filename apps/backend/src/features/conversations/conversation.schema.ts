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
export type GroupConversationInputRepository= {
  ownerId: string;
  memberIds: string[];
  name: string;
  uploadId?: string;
}

export type GroupConversationInput = {
  memberIds: string[];
  name: string;
  uploadId?: string;
}

export type GroupConversation = {
  id: string;
  type: string;
  name: string;
  ownerId?: string;
  uploadId?: string;
  createdAt: Date; 
}

export type CreateDirectConversationInput = {
  otherUserId: string;
  type: "direct";
}

export type CreateGroupConversationInput = {
  memberIds: string[];
  uploadId?: string;
  type: "group";
  name: string;
}
export type CreateConversationInput = CreateGroupConversationInput | CreateDirectConversationInput;
