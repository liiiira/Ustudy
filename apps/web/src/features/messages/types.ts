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
