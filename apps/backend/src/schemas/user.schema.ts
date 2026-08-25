import {z} from 'zod';

export const registerSchema = z.object({

  username: z.string().min(3).max(25),
  password: z.string().min(8).max(24),
  email: z.email(),
})

export const idSchema = z.object({
  id: z.uuid(),
})

export type UserInput = z.infer<typeof registerSchema>;

export interface CreateUserRepository {
  username: string,
  hashedPassword: string,
  email: string,
}

export interface User {
  id: string,
  username: string,
  email: string,
  createdAt?: Date,
  hashedPassword?: string, 
}


