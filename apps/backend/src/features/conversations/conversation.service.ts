import { AppError } from "../../errors/appError";
import type { UserAuth } from "../users/user.schema";
import * as userService from "../users/user.service.ts";
import * as conversationRepository from  "./conversation.repository.ts";
import type { CreateConversationInput, DirectConversation, GroupConversation, GroupConversationInput } from "./conversation.schema.ts";


export async function createOrFindConversation(requesterId: string, body: CreateConversationInput): Promise<{created: boolean, conversation: GroupConversation | DirectConversation}>{

  switch(body.type){
    case "direct": return findOrCreateDirect(requesterId, body.otherUserId);
    case "group": return createGroup(requesterId, 
      {
        memberIds: body.memberIds, 
        name: body.name, 
        uploadId: body.uploadId
      });
  }
}


async function findOrCreateDirect(requesterId: string, otherUserId: string): Promise<{created: boolean, conversation: DirectConversation}>{

  if(requesterId === otherUserId) throw new AppError("Cannot message yourself", 400);

  const otherUser: UserAuth | null = await userService.findById(otherUserId);

  if(!otherUser) throw new AppError("User not found", 404);

  const [a, b] = [requesterId, otherUserId].sort();
  const directKey = `${a}:${b}`;

  const response = await conversationRepository.findOrCreateDirect({directKey, requesterId, otherUserId})
  if(!response) throw new AppError("Failed to create or find the direct conversation", 500);

  return response;
}

async function createGroup(requesterId: string, {memberIds, name, uploadId}: GroupConversationInput): Promise<{created: boolean, conversation: GroupConversation}>{
  
  const ownerId = requesterId;

  if(!memberIds.includes(ownerId))
    memberIds.push(ownerId);

  const existingUserIds: string[] = await userService.findExistingIds(memberIds);
  const missingUserIds: string[] = memberIds.filter((memberId) => !existingUserIds.includes(memberId))

  if(missingUserIds.length > 0)
    throw new AppError("Some users were not found", 400, {missingUserIds})

  const groupConversation: GroupConversation | null = await conversationRepository.createGroup({memberIds, uploadId, name, ownerId});

  if(!groupConversation)
    throw new AppError("Couldn't create group conversation due to internal error", 500);

  return {created: true, conversation: groupConversation};
}




