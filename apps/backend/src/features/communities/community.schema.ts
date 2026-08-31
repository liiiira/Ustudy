import {z} from "zod"

export type CommunityCreate = {
  ownerId: string;
  name: string;
  description: string;
}

export type CommunityDB = {
  id: string;
  ownerId: string;
  createdAt: string;
  name: string;
  description: string;
}

export const createCommunitySchema = z.object({

  name: z.string().min(3).max(40),
  description: z.string().min(3).max(100)

})
