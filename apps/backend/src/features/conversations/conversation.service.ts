import { AppError } from "../../errors/appError";
import type { UserAuth } from "../users/user.schema";
import * as userService from "../users/user.service.ts";
import * as uploadService from "../uploads/upload.service.ts"
import * as conversationRepository from  "./conversation.repository.ts";

import type { Conversation, CreateConversationInput, DirectConversation, GroupConversation, GroupConversationInput } from "./conversation.schema.ts";


export async function createOrFindConversation(requesterId: string, body: CreateConversationInput): Promise<{created: boolean, conversation: Conversation}>{

  switch(body.type){
    case "direct": return findOrCreateDirect(requesterId, body.otherUserId);
    case "group": return createGroup(requesterId, 
      {
        memberIds: body.memberIds, 
        name: body.name, 
        imageUrl: body.imageUrl
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

async function createGroup(requesterId: string, {memberIds, name, imageUrl}: GroupConversationInput): Promise<{created: boolean, conversation: GroupConversation}>{
  
  const ownerId = requesterId;
  const uniqueMemberIds: string[] = [...new Set([...memberIds, ownerId])];
  const existingUserIds: string[] = await userService.findExistingIds(uniqueMemberIds);
  const missingUserIds: string[] = uniqueMemberIds.filter((memberId) => !existingUserIds.includes(memberId))

  if(missingUserIds.length > 0)
    throw new AppError("Some users were not found", 400, {missingUserIds})

  let uploadId: string | undefined;
  if(imageUrl){
    const upload = await uploadService.verifyUploadOwnerShip(ownerId, {conversationUrl: imageUrl});
    uploadId = upload.id;
  } 

  const groupConversation: GroupConversation | null = await conversationRepository.createGroup({memberIds: uniqueMemberIds, uploadId, name, ownerId});
  if(!groupConversation)
    throw new AppError("Couldn't create group conversation due to internal error", 500);

  return {created: true, conversation: groupConversation};
}


export async function getById(requesterId: string, conversationId: string): Promise<Conversation>{

  const conversation = await findById(conversationId);
  if(!conversation) throw new AppError("Conversation doesn't exist", 404);

  const member = await findMember(conversationId, requesterId);
  if(!member) throw new AppError("You are not a member of this Conversaiton", 403);

  return conversation;
}


export async function findById(conversationId: string): Promise<Conversation | null> {

  return conversationRepository.findById(conversationId);
}

export async function findMemberIds(conversationId: string): Promise<string[]>{
  return conversationRepository.findMemberIds(conversationId);
}

async function findMember(conversationId: string, memberId: string){
  return conversationRepository.findMember(conversationId, memberId);
}

