import { authFetch } from "../../../lib/api";
import type {
  AddMembersBody,
  Conversation,
  ConversationUpdate,
  CreateConversationInput,
  GetConversation,
} from "../types";

export async function create(
  conversationData: CreateConversationInput,
): Promise<{ created: boolean; conversation: Conversation }> {
  const data = await authFetch("/conversations", {
    method: "POST",
    body: conversationData,
  });

  switch (data.message) {
    case "Conversation created successfuly":
      return { created: true, conversation: data.conversation };
    case "Conversation found successfuly":
      return { created: false, conversation: data.conversation };
    default:
      throw new Error("Error in create conversation api");
  }
}

export async function getAll(): Promise<GetConversation[]> {
  const data = await authFetch("/conversations", {
    method: "GET",
  });

  return data.conversations;
}

export async function getById(id: string): Promise<Conversation> {
  const data = await authFetch(`/conversations/${id}`, {
    method: "GET",
  });

  return data.conversation;
}

export async function updateById(
  id: string,
  conversationData: ConversationUpdate,
): Promise<Conversation> {
  const data = await authFetch(`/conversations/${id}`, {
    method: "PATCH",
    body: conversationData,
  });

  return data.conversation;
}

export async function deleteById(id: string): Promise<{ id: string }> {
  const data = await authFetch(`/conversations/${id}`, {
    method: "DELETE",
  });

  return data.conversation;
}

// Members

export async function addMembers(
  conversationId: string,
  membersData: AddMembersBody,
): Promise<string[]> {
  const data = await authFetch(`/conversations/${conversationId}/members`, {
    method: "POST",
    body: membersData,
  });

  return data.members;
}

export async function removeMember(
  conversationId: string,
  memberId: string,
): Promise<{ id: string }> {
  const data = await authFetch(
    `/conversations/${conversationId}/members/${memberId}`,
    {
      method: "DELETE",
    },
  );

  return data.member;
}
