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
  ownerId: string;
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
