import {z} from "zod"

export type CommentInput = {
  textContent: string;
}
export type CommentUpdate = {
  textContent?: string;
}
export type CommentCreate = CommentInput & {
  ownerId: string;
  postId: string;
}

export type CommentDB = CommentCreate & {
  id: string;
  createdAt: string;
}

export type CommentJoinUser = CommentDB & {
  ownerUsername: string;
}

export const commentInputSchema = z.object({
  textContent: z.string().min(1).max(1000),
})

export const commentUpdateSchema = z.object({
  textContent: z.string().min(1).max(1000).optional(),
})


export const postIdSchema = z.object({
  communityId: z.uuid(),
  postId: z.uuid(),
});

export const commentIdSchema = z.object({
  communityId: z.uuid(),
  postId: z.uuid(), 
  commentId: z.uuid(),
})
