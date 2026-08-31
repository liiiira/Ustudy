import * as communityService from "./community.service.ts";
import {type Request, type Response} from "express"
import { type CommunityDB } from "./community.schema";

export async function create(req: Request, res: Response){

  const {name, description} = req.body;
  const ownerId = req.user!.id;
  
  const createdCommunity: CommunityDB = await communityService.create({name, description, ownerId});
  
  res.status(201).json({
    status: "success",
    message: "Community Created Successfuly",
    community: createdCommunity,
  })
}
