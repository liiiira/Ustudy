import { authFetch } from "../../../lib/api";
import type { Message, MessageInput } from "../types";

export async function create(
  conversationId: string,
  messageData: MessageInput,
): Promise<Message> {
  const data = await authFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: messageData,
  });

  return data.chatMessage;
}

export async function findAllConversation(
  conversationId: string,
): Promise<{ messages: Message[]; nextCursor: number }> {
  const data = await authFetch(`/conversations/${conversationId}/messages`, {
    method: "GET",
  });

  return { messages: data.messages, nextCursor: data.nextCursor };
}

export async function deleteById(
  conversationId: string,
  messageId: string,
): Promise<{ id: string }> {
  const data = await authFetch(
    `/conversations/${conversationId}/messages/${messageId}`,
    { method: "DELETE" },
  );

  return data.chatMessage;
}
