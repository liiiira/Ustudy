import * as postRepository from "./post.repository.ts"
import type { PostInput, Post } from "./post.schema.ts";
import {AppError} from "../../errors/appError.ts"

export async function create(ownerId: string, communityId: string,  postData: PostInput): Promise<Post>{
  
  const createdPost: Post | null = await postRepository.create(ownerId, communityId, postData)

  if(!createdPost)
    throw new AppError("Failed to create post", 500);

  return createdPost;
}


