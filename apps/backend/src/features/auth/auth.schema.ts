import {z} from 'zod';

export const loginSchema = z.object({

  password: z.string().min(8).max(24),
  email: z.email(),

})

export type InputRefreshToken = {
  userId: string;
  hashedToken: string;
  expiresAt: Date;
}

export type DbRefreshToken = {
  hashedToken: string;
  userId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  id: string;
}

export type UserToken = {
  userId: string;
  id: string;
}


