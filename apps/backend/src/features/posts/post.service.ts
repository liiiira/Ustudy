import * as postRepository from "./post.repository.ts"
import * as communityService from "../communities/community.service.ts"
import type { PostInput, Post, PostJoined, PostUpdate } from "./post.schema.ts";
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

export async function updateById(userId: string, postId: string, communityData: PostUpdate) : Promise<Post | null>{

  const {title, textContent} = communityData;

  const post: Post | null = await findById(postId);

  if(!post)
    throw new AppError("Post doesn't exist", 404);

  if(userId !== post.ownerId) 
    throw new AppError("You are not allowed to update this post", 403)

  if(!title && !textContent)
    throw new AppError("Body is Empty", 400);

  const modifiedAttributes: Record<string, string> = {}
  
  // check if post title changed
  if (title && post.title !== title)
    modifiedAttributes["title"] = title;

  // Check if post text content exists and changed 
  if (textContent && post.textContent !== textContent)
    modifiedAttributes["textContent"] = textContent;

  // Check if nothing changed  
  if (Object.keys(modifiedAttributes).length === 0)
    return null;

  const updatedPost: Post | null = await postRepository.updateById(postId, modifiedAttributes)
   
  if (!updatedPost)
    throw new AppError("Post Was Not Updated", 500, "Unknown Failure");

  return updatedPost;
}

export async function deleteById(postId: string, userId: string): Promise<{id: string}>{

  const post: Post | null = await findById(postId);

  if(!post)
    throw new AppError("Post doesn't exist", 404);

  if(userId !== post.ownerId) 
    throw new AppError("You are not allowed to delete this community", 403)
  
  const deletedPost: {id: string} | null = await postRepository.deleteById(postId);

  if(!deletedPost)
    throw new AppError("Failed to delete the post", 500);

  return deletedPost
}
