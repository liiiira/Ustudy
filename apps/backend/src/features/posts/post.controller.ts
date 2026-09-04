import * as postService from "./post.service.ts";
import type { Post, PostInput } from "./post.schema.ts";
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



