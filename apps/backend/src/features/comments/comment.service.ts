import * as commentRepository from "./comment.repository.ts";
import { CommentInput, CommentDB } from "./comment.schema.ts";
import { AppError } from "../../errors/appError";

export async function create(ownerId: string, postId: string, commentInput: CommentInput): Promise<CommentDB>{

  
  const createdComment: CommentDB | null = await commentRepository.create({...commentInput, postId, ownerId});
  
  if(!createdComment)
    throw new AppError("Unexpected Internal Error: Failed to create post", 500);

  return createdComment
}
