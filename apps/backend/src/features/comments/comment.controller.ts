import * as commentService from "./comment.service.ts";
import type { Request, Response } from "express";
import type { CommentDB, CommentInput, CommentJoinUser } from "./comment.schema.ts";

export async function create(req: Request<{communityId: string, postId: string}>, res: Response){

  const {postId} = req.params; 
  const ownerId: string = req.user!.id;
  const commentInput: CommentInput = req.body;

  const createdComment: CommentDB = await commentService.create(ownerId, postId, commentInput);

  return res.status(201).json({
    status: "success",
    message: "Comment created successfuly",
    comment: createdComment
  });
}

export async function findAllPost(req: Request<{communityId: string, postId: string}>, res: Response){

  const {postId} = req.params;
  
  const postComments: CommentJoinUser[] = await commentService.findAllPost(postId);

  return res.status(200).json({
    status: "success",
    message: "Post's comments fetched successfuly",
    comments: postComments,
  })
}

export async function updateById(req: Request<{communityId: stirng, postId: stirng, commentId: string}>, res: Response){

  const {commentId} = req.params;
  const userId: string = req.user!.id;
  const {textContent} = req.body;

  const updatedComment: CommentDB | null = await commentService.updateById(userId,commentId , {textContent})

  if(!updatedComment)
    return res.status(204).json();
  
  return res.status(200).json({
    status: "success",
    message: "Comment Updated Successfuly", 
    comment: updatedComment
  })

}

