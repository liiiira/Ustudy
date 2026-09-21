import { AppError } from "../../errors/appError";
import type { UserAuth } from "../users/user.schema";
import * as userService from "../users/user.service.ts";
import * as uploadService from "../uploads/upload.service.ts"
import * as conversationRepository from  "./conversation.repository.ts";

import type { Conversation, ConversationMember, ConversationUpdate, CreateConversationInput, DirectConversation, GroupConversation, GroupConversationInput } from "./conversation.schema.ts";



// Conversations

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



export async function updateById(requesterId: string, conversationId: string, body: ConversationUpdate): Promise<Conversation>{

  const conversation = await findById(conversationId);
  if(!conversation) throw new AppError("Conversation not found", 404);

  const requesterMember: ConversationMember | null = await findMember(conversationId, requesterId);
  if(!requesterMember) throw new AppError("You are not a member of this conversation", 403);

  switch(conversation.type){
    case "group":
      return updateGroup(requesterMember, conversation as GroupConversation, body);

    case "direct":
      return updateDirect(requesterMember, conversation as DirectConversation, body);

    default:
      throw new AppError("Unknown conversation type", 500);
  }
}

async function updateGroup(requesterMember: ConversationMember, group: GroupConversation, {name, imageUrl}: ConversationUpdate): Promise<GroupConversation>{

  if(!name && !imageUrl) throw new AppError("Nothing to update", 400);

  if(requesterMember.role !== "admin") throw new AppError("Only an admin can update this conversation", 403);

  let uploadId: string | undefined;
  if(imageUrl){
    const upload = await uploadService.verifyUploadOwnerShip(requesterMember.memberId, {conversationUrl: imageUrl});
    uploadId = upload.id;
  }

  const updatedGroup: GroupConversation | null = await conversationRepository.updateGroup(group.id, {uploadId, name});
  if(!updatedGroup)
    throw new AppError("Group didn't update unexpected error", 500);

  return updatedGroup;
}

// NOTE: maybe wwe will add update direct conversation functionality
async function updateDirect(_requesterMember: ConversationMember, _direct: DirectConversation, _body: ConversationUpdate): Promise<DirectConversation>{
  throw new AppError("Direct conversations cannot be updated", 400);
}


export async function deleteById(requesterId: string, conversationId: string,): Promise<{id: string}>{

  const conversation = await findById(conversationId);
  if(!conversation) throw new AppError("Conversation not found", 404);

  const requesterMember: ConversationMember | null = await findMember(conversationId, requesterId);
  if(!requesterMember) throw new AppError("You are not a member of this conversation", 403);

  switch(conversation.type){
    case "group":
      return deleteGroup(requesterMember, conversation as GroupConversation);

    case "direct":
      throw new AppError("Cannot delete a direct conversation" , 400);
    default:
      throw new AppError("Unknown conversation type", 500);
  }
}


export async function deleteGroup(requesterMember: ConversationMember, groupConversation: GroupConversation): Promise<{id: string}>{

  if(requesterMember.role !== "admin") throw new AppError("Only and admin can delete this group conversation", 403);
  
  const response = await conversationRepository.deleteGroup(groupConversation.id);
  if(!response) throw new AppError("Failed to delete group conversation due to unexpected error", 500);

  return response;
}





// Members 

export async function addMembers(requesterId: string, conversationId: string, { memberIds } :{memberIds: string[]}){

  const conversation = await findById(conversationId)
  if(!conversation) throw new AppError("Conversation not found", 404);
  if(conversation.type === "direct") throw new AppError("Cannot add members to a direct conversation", 400);

  const requesterMember: ConversationMember | null = await findMember(conversationId, requesterId)

  if(!requesterMember) throw new AppError("You are not a member of this conversation", 404);
  if(requesterMember.role !== "admin") throw new AppError("Only an admin can add members to this conversation", 403);

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingUserIds: string[] = await userService.findExistingIds(uniqueMemberIds);
  const missingUserIds: string[] = uniqueMemberIds.filter((memberId) => !existingUserIds.includes(memberId));

  if(missingUserIds.length > 0)
    throw new AppError("Some users were not found", 400, {missingUserIds});

  const addedMembers: string[] = await conversationRepository.addMembers(conversationId, uniqueMemberIds);

  return addedMembers;

}


export async function findMember(conversationId: string, memberId: string){
  return conversationRepository.findMember(conversationId, memberId);
}


export async function findMemberIds(conversationId: string): Promise<string[]>{
  return conversationRepository.findMemberIds(conversationId);
}

export async function removeMember(requesterId: string, conversationId: string, memberId: string): Promise<{memberId: string}>{

  const conversation = await findById(conversationId);
  if(!conversation) throw new AppError("Conversation not found", 404);
  if(conversation.type === "direct") throw new AppError("Cannot remove members from a direct conversation", 400);

  const requesterMember: ConversationMember | null = await findMember(conversationId, requesterId);
  if(!requesterMember) throw new AppError("You are not a member of this conversation", 403);

  const targetMember: ConversationMember | null = requesterId === memberId
    ? requesterMember
    : await findMember(conversationId, memberId);
  if(!targetMember) throw new AppError("Member not found in this conversation", 404);

  if(targetMember.role === "admin") throw new AppError("An admin cannot be removed from the conversation", 400);

  const isSelf = requesterId === memberId;
  if(!isSelf && requesterMember.role !== "admin")
    throw new AppError("Only an admin can remove other members", 403);

  const removed = await conversationRepository.removeMember(conversationId, memberId);
  if(!removed) throw new AppError("Member was not removed due to an unexpected error", 500);

  return removed;
}
