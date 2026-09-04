import * as postRepository from "./post.repository.ts"
import * as communityService from "../communities/community.service.ts"
import type { PostInput, Post, PostJoined } from "./post.schema.ts";
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


export async function findById(postId: string): Promise<Post | null>{
  
  return await postRepository.findById(postId);
}


export async function getById(postId: string): Promise<PostJoined>{

  const post: PostJoined | null = await postRepository.findByIdJoin(postId);

  if(!post)
    throw new AppError("Post was not found", 404);

  return post;
}

export async function findAllCommunity(communityId: string): Promise<Post[]>{

  const posts: Post[] = await postRepository.findAllCommunity(communityId)

  return posts;
}
