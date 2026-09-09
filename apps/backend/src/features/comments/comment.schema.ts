import {z} from "zod"

export type CommentCreate = {
  ownerId: string;
  postId: string
  textContent: string;
}
export type CommentDB = {
  id: string;
  ownerId: string;
  postId: string;
  textContent: string;
  createdAt: string;
}

export type CommentInput = {
  textContent: string;
}

export const commentInputSchema = z.object({
  textContent: z.string().min(1).max(1000),
})


export const postIdSchema = z.object({
  communityId: z.uuid(),
  postId: z.uuid(),
});
