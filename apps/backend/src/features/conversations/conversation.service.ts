import { AppError } from "../../errors/appError";
import type { UserAuth } from "../users/user.schema";
import * as userService from "../users/user.service.ts";
import * as conversationRepository from  "./conversation.repository.ts";
import type { DirectConversation } from "./conversation.schema.ts";


export async function findOrCreateDirect(requesterId: string, otherUserId: string): Promise<DirectConversation>{

  if(requesterId === otherUserId) throw new AppError("Cannot message yourself", 400);

  const otherUser: UserAuth | null = await userService.findById(otherUserId);

  if(!otherUser) throw new AppError("User not found", 404);

  const [a, b] = [requesterId, otherUserId].sort();
  const directKey = `${a}:${b}`;

  const conversation: DirectConversation | null = await conversationRepository.findOrCreateDirect({directKey, requesterId, otherUserId})
  if(!conversation) throw new AppError("Failed to create or find the direct conversation", 500);

  return conversation;
}


