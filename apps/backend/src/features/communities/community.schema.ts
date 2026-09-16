import {z} from "zod"

export type CommunityCreate = {
  ownerId: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export type CommunityDB = CommunityCreate & {
  id: string;
  createdAt: string;
}

export type CommmunityJoinUser = CommunityDB & {
  ownerName: string;
}

export type UpdateCommunityRepository = {
  name?: string;
  description?: string;
  imageUrl?: string;
}


export const createCommunitySchema = z.object({

  name: z.string().min(3).max(40),
  description: z.string().min(3).max(100),
  imageUrl: z.url().optional(),
})


export const updateCommunitySchema = z.object({

  name: z.string().min(3).max(40).optional(),
  description: z.string().min(3).max(100).optional(),
  imageUrl: z.url().optional()

});


export const idSchema = z.object({
  id: z.uuid(),
})



