import type { Message, MessageInput } from "./message.schema.ts";
import * as messageService from "./message.service.ts";
import type {Request, Response} from "express";


export async function create(req: Request<{conversationId: string}>, res: Response){
  
  const userId = req.user!.id;
  const {conversationId} = req.params;
  const requestBody: MessageInput  = req.body;

  const createdMessage: Message = await messageService.create(userId, conversationId, requestBody);

  return res.status(201).json({
    status: "success",
    message: "Message Created Sucessfully",
    chatMessage: createdMessage,
  })
}
