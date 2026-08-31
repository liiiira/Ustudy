import { AppError } from "../../errors/appError.ts";
import * as communityRepository from "./community.repository.ts";
import { type CommunityCreate, type CommunityDB } from "./community.schema.ts";

export async function create(CommunityCreate: CommunityCreate): Promise<CommunityDB>{
   
  const {ownerId, name, description} = CommunityCreate;

  const nameExists = await findByName(name);

  if(nameExists)
    throw new AppError("Community name already taken", 409);

  const createdCommunity: CommunityDB | null = await communityRepository.create({ownerId, name, description})

  if (!createdCommunity)
    throw new AppError("Unexpected Failure, failed to created community", 500);

  return createdCommunity;
}

async function findByName(name: string): Promise<CommunityDB | null>{
    return await communityRepository.findByName(name);
}
