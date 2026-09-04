import * as postService from "./post.service.ts";
import { communityIdSchema, PostUpdate, type Post, type PostInput, type PostJoined } from "./post.schema.ts";
import { Request, Response } from "express";



export async function create(req: Request<{communityId: string}>, res: Response){

  const ownerId: string = req.user!.id;
  const {communityId} = req.params;
  const postData: PostInput = req.body;

  const createdPost: Post = await postService.create(ownerId, communityId, postData);

  return res.status(201).json({
    message: "Post Created Successfuly",
    status: "success",
    post: createdPost,
  });
}

export async function findById(req: Request<{communityId: string, postId: string}>, res: Response){

  const {postId} = req.params;

  const foundPost: PostJoined = await postService.getById(postId)
  
  return res.status(200).json({
    message: "Post Fetched Successfuly",
    status: "success",
    post: foundPost,
  });
}

export async function findAllCommunity(req: Request<{communityId: string}>, res: Response){

  const {communityId} = req.params;

  const communityPosts: Post[] = await postService.findAllCommunity(communityId);

  return res.status(200).json({
    Message: "Community Posts Fetched Successfuly",
    status: "success",
    posts: communityPosts,
  })
}

export async function updateById(req: Request<{communityId: string, postId: string}> , res: Response){

  const userId: string = req.user!.id;
  const {postId} = req.params;
  const {title, textContent} = req.body;

  const updatedPost: Post | null = await postService.updateById(userId, postId, {title, textContent})

  if(!updatedPost)
    return res.status(204).json();

  return res.status(200).json({
    message: "Post Updated Successfuly",
    status: "success",
    post: updatedPost,
  })
}

export async function deleteById(req: Request<{communityId: string, postId: string}>, res: Response){

  const userId: string = req.user!.id;
  const {postId} = req.params;
  
  const deletedPost: {id: string} = await postService.deleteById(postId, userId);

  return res.status(200).json({
    message: "Post Deleted Successfuly", 
    status: "success",
    post: deletedPost
  });
}

