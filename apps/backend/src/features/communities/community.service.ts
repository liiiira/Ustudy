import { AppError } from "../../errors/appError.ts";
import * as communityRepository from "./community.repository.ts";
import { type CommmunityJoinUser, type UpdateCommunityRepository, type CommunityCreate, type CommunityDB } from "./community.schema.ts";

export async function create(CommunityCreate: CommunityCreate): Promise<CommunityDB>{
   
  const {ownerId, name, description, imageUrl} = CommunityCreate;

  const nameExists = await findByName(name);

  if(nameExists)
    throw new AppError("Community name already taken", 409);

  const createdCommunity: CommunityDB | null = await communityRepository.create({ownerId, name, description, imageUrl})

  if (!createdCommunity)
    throw new AppError("Unexpected Failure, failed to created community", 500);

  return createdCommunity;
}


async function findByName(name: string): Promise<CommunityDB | null>{

    return await communityRepository.findByName(name);
}

export  async function findById(id: string): Promise<CommunityDB | null>{

  const foundCommunity = await communityRepository.findById(id);
  return foundCommunity;
}

export async function getByIdJoinUser(id: string): Promise<CommmunityJoinUser>{

  const foundCommunity = await communityRepository.findByIdJoinUser(id);
  
  if(!foundCommunity)
    throw new AppError("Community was not found", 404);

  return foundCommunity;
}


export async function getById(id: string): Promise<CommunityDB>{
  const foundCommunity: CommunityDB | null = await findById(id)
  
  if(!foundCommunity)
    throw new AppError("Community was not found", 404);

  return foundCommunity;
}

export async function findAll(): Promise<CommunityDB[]>{
  return await communityRepository.findAll();
}

export async function updateById(userId: string, id: string, communityData:UpdateCommunityRepository) : Promise<CommunityDB | null>{

  const {name, description, imageUrl} = communityData;
  const community: CommunityDB | null = await findById(id);

  if(!community)
    throw new AppError("Community doesn't exist", 404);

  if(userId !== community.ownerId) 
    throw new AppError("You are not allowed to update this community", 403)

  if(!name && !description && !imageUrl)
    throw new AppError("Body is Empty", 400);

  const modifiedAttributes: Record<string, string> = {}
  
  // check if community name changed
  if (name && community.name !== name){
    // check if the new usename  is used by another user
    const usernameExists: CommunityDB | null = await findByName(name);

    if (usernameExists)
      throw new AppError("New Community Name Is Already Used", 409);

    modifiedAttributes["name"] = name;
  }

  // Check if description exists and changed 
  if (description && community.description !== description)
    modifiedAttributes["description"] = description;

  if (imageUrl && community.imageUrl !== imageUrl)
    modifiedAttributes["imageUrl"] = imageUrl;

  // Check if nothing changed  
  if (Object.keys(modifiedAttributes).length === 0)
    return null;

  const updatedCommunity: CommunityDB | null = await communityRepository.updateById(id, modifiedAttributes)
  
  if (!updatedCommunity)
    throw new AppError("Community Was Not Updated", 500, "Unknown Failure");

  return updatedCommunity;
}

export async function delelteById(userId: string, id: string): Promise<{id: string}>{

  const community: CommunityDB | null = await findById(id);

  if(!community)
    throw new AppError("Community was not found", 404);

  if(community.ownerId !== userId)
    throw new AppError("You are not allowed to delete this community", 403);
  
  const deletedCommunity: {id: string} | null = await communityRepository.deleteById(id);

  if(!deletedCommunity)
    throw new AppError("User Not Found", 404);
  
  return deletedCommunity;
}
