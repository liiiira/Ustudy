import {z} from "zod"

export type PostInput = {
  title: string;
  textContent: string;
}

export type Post = {
  id: string;
  title: string;
  textContent: string;
  ownerId: string;
  communityId: string;
  cratedAt: Date,
}

export type PostJoined = {
  id: string;
  title: string;
  textContent: string;
  ownerId: string;
  ownerName: string;
  communityId: string;
  communityName: string;
  cratedAt: Date,
}

export const postInputSchema = z.object({
  title: z.string().min(1).max(100),
  textContent: z.string().min(1).max(1000),
});

export const communityIdSchema = z.object({
  communityId: z.uuid(),
})

export const postIdSchema = z.object({
  communityId: z.uuid(),
  postId: z.uuid(),
})
  
