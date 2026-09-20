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
