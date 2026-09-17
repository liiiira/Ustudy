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

// Service-level update input — public-facing shape, imageUrl as a string.
// (Named UpdateCommunityRepository before this pass despite being the
// service-level type, not the repository one — renamed for clarity now
// that a real repository-level type exists below.)
export type CommunityUpdate = {
  name?: string;
  description?: string;
  imageUrl?: string;
}

// Repository-level types: the DB stores an `upload_id` FK, not a URL
// string — these carry `uploadId`, resolved by the service from a
// submitted `imageUrl` via uploadService.verifyUploadOwnerShip before the
// repository is ever called.
export type CommunityCreateRepository = {
  ownerId: string;
  name: string;
  description: string;
  uploadId?: string;
}

export type CommunityUpdateRepository = {
  name?: string;
  description?: string;
  uploadId?: string;
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



