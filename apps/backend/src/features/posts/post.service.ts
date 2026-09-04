import * as postRepository from "./post.repository.ts"
import * as communityService from "../communities/community.service.ts"
import type { PostInput, Post } from "./post.schema.ts";
import {AppError} from "../../errors/appError.ts"
import { CommunityDB } from "../communities/community.schema.ts";

export async function create(ownerId: string, communityId: string,  postData: PostInput): Promise<Post>{
  
  const communityExists: CommunityDB | null = await communityService.findById(communityId);

  if(!communityExists)
    throw new AppError("Community was not found", 404);
  
  const createdPost: Post | null = await postRepository.create(ownerId, communityId, postData)

  if(!createdPost)
    throw new AppError("Failed to create post", 500);

  return createdPost;
}


