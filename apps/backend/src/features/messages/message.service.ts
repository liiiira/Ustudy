import * as messageRepository from "./message.repository.ts";
import * as uploadService from "../uploads/upload.service.ts";
import * as conversationService from "../conversations/conversation.service.ts";
import type { Message, MessageInput } from "./message.schema.ts";
import { AppError } from "../../errors/appError.ts";


export async function create(requesterId: string, conversationId: string, {textContent, imageUrl}: MessageInput){

  if(!textContent && !imageUrl) throw new AppError("Message must contain at least a text or an image", 400);
  
  const conversation = await conversationService.findById(conversationId);
  if(!conversation) throw new AppError("Conversation Not found", 404);

  const requesterMember = await conversationService.findMember(conversationId, requesterId);
  if(!requesterMember) throw new AppError("Not a member of this conversation", 403);
  
  let uploadId: string | undefined;
  if(imageUrl){
    const upload = await uploadService.verifyUploadOwnerShip(requesterId, {conversationUrl: imageUrl});
    uploadId = upload.id;
  } 

  const createdMessage: Message | null = await messageRepository.create({conversationId, senderId: requesterId, textContent, uploadId})
  if(!createdMessage) throw new AppError("Failed to create message due to unnexpected error", 500);

  return createdMessage;
}
