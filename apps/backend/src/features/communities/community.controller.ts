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

export async function findAll(req: Request, res: Response){

  const foundCommunities: CommunityDB[] = await communityService.findAll();

  res.status(200).json({
    status: "success",
    message: "Communities Found Successfuly",
    communities: foundCommunities
  })
}

export async function updateById(req: Request<{id: string}>, res: Response){
  
  const userId: string = req.user!.id;
  const {id} = req.params;
  const {name, description } = req.body;
  const updatedCommunity: CommunityDB | null = await communityService.updateById(userId, id, {name, description})

  // Nothing changed
  if (!updatedCommunity)
    return res.status(204).json({})

 
  return res.status(200).json({
    status: "success",
    community: updatedCommunity,
    message: "Community Updated Successfully"
  })
}

export async function deleteById(req: Request<{id: string}>, res: Response){
  
  const userId: string = req.user!.id;
  const {id} = req.params;
  const deletedCommunity: {id: string} = await communityService.delelteById(userId, id);
  
  return res.status(200).json({
    status: "success",
    message: "Community deleted successfuly",
    community: deletedCommunity,
  })
}
