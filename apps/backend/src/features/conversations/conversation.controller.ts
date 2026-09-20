import type {Request, Response} from "express";
import * as conversationService from "./conversation.service.ts";

export async function create(req: Request, res: Response){
  const userId = req.user!.id;
  const requestBody = req.body;
  const {created, conversation} = await conversationService.createOrFindConversation(userId, requestBody);
  
  const statusCode = created ? 201 : 200;
  const responseMessage = created ? "Conversation created successfuly": "Conversation found successfuly";

  res.status(statusCode).json({
    status: "success",
    message: responseMessage,
    conversation: conversation,
  })
  
}
