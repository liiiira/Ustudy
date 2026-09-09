import * as commentRepository from "./comment.repository.ts";
import * as postRepository from "../posts/post.repository.ts"
import { CommentInput, CommentDB } from "./comment.schema.ts";
import { AppError } from "../../errors/appError";
import { Post } from "../posts/post.schema.ts";

export async function create(ownerId: string, postId: string, commentInput: CommentInput): Promise<CommentDB>{

  const postExists: Post | null = await postRepository.findById(postId)

  if(!postExists)
    throw new AppError("Community was not found", 404);
  
  const createdComment: CommentDB | null = await commentRepository.create({...commentInput, postId, ownerId});
  
  if(!createdComment)
    throw new AppError("Unexpected Internal Error: Failed to create post", 500);

  return createdComment
}
