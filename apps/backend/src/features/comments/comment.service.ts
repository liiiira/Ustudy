import * as commentRepository from "./comment.repository.ts";
import * as postRepository from "../posts/post.repository.ts"
import { CommentInput, CommentDB, CommentJoinUser, CommentUpdate } from "./comment.schema.ts";
import { AppError } from "../../errors/appError";
import { Post } from "../posts/post.schema.ts";

export async function create(ownerId: string, postId: string, commentInput: CommentInput): Promise<CommentJoinUser>{

  const postExists: Post | null = await postRepository.findById(postId)

  if(!postExists)
    throw new AppError("Post was not found", 404);
  
  const createdComment: CommentJoinUser | null = await commentRepository.create({...commentInput, postId, ownerId});
  
  if(!createdComment)
    throw new AppError("Unexpected Internal Error: Failed to create comment", 500);

  return createdComment
}

export async function findAllPost(postId: string): Promise<CommentJoinUser[]>{

   const postExists: Post | null = await postRepository.findById(postId)

  if(!postExists)
    throw new AppError("Post was not found", 404); 

  const postComments: CommentJoinUser[] = await commentRepository.findAllPost(postId);
  
  return postComments;
}

export async function findById(commentId: string): Promise<CommentDB | null>{
  return commentRepository.findById(commentId)
}

export async function updateById(userId: string, commentId: string, commentData: CommentUpdate): Promise<CommentDB | null>{

  const {textContent} = commentData;

  const comment: CommentDB | null = await findById(commentId);

  if(!comment)
    throw new AppError("Comment doesn't exist", 404);

  if(userId !== comment.ownerId) 
    throw new AppError("You are not allowed to update this comment", 403)


  if(!textContent)
    throw new AppError("Body is Empty", 400);


  // NOTE: it's unnecessary now. it's just to make adding new data to a comment easier later
  const modifiedAttributes: Record<string, string> = {}
  
  if (textContent && comment.textContent !== textContent)
    modifiedAttributes["textContent"] = textContent;

  if (Object.keys(modifiedAttributes).length === 0)
    return null;

  const updatedComment: CommentDB | null = await commentRepository.updateById(commentId, {textContent});
  
  if(!updatedComment)
    throw new AppError("Unexpected Internal Error: Failed to update comment", 500);
 
  return updatedComment;
}

export async function deleteById(userId: string ,commentId: string){

  const comment: CommentDB | null = await findById(commentId); 
  
  if(!comment)
    throw new AppError("Comment was not found", 404);

  if(userId !== comment.ownerId)
    throw new AppError("You are not allowed to delete this comment", 403);

  const deletedPost: {id: string} | null = await commentRepository.deleteById(commentId)

  if(!deletedPost)
    throw new AppError("Internal error: Failed to delete post", 500);

  return deletedPost;
}
