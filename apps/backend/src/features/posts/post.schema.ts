import {z} from "zod"

export type PostInput = {
  title: string;
  textContent: string;
  imageUrl?: string;
}

export type PostUpdate = {
  title?: string;
  textContent?: string;
}

export type Post = PostInput & {
  postId: string;
  ownerId: string;
  communityId: string;
  createdAt: Date,
}


export type PostJoined = Post & {
  ownerName: string;
}

export const postInputSchema = z.object({

  title: z.string().min(1).max(100),
  textContent: z.string().min(1).max(1000),
  imageUrl: z.url().optional(),

});

export const postUpdateSchema = z.object({

  title: z.string().min(1).max(100).optional(),
  textContent: z.string().min(1).max(1000).optional(), 
  imageUrl: z.url().optional()

})

export const communityIdSchema = z.object({
  communityId: z.uuid()
});

export const postIdSchema = z.object({
  communityId: z.uuid(),
  postId: z.uuid(),
});
