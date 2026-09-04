import * as postService from "./post.service.ts";
import { communityIdSchema, type Post, type PostInput, type PostJoined } from "./post.schema.ts";
import { Request, Response } from "express";
import { findAllCommunity } from "./post.repository.ts";


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


