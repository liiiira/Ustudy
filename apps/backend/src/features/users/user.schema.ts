import {z} from 'zod';

export const registerSchema = z.object({

  username: z.string().min(3).max(25),
  password: z.string().min(8).max(24),
  email: z.email(),
  avatarUrl: z.url().optional(),
})




export const updateSchema = z.object({
  username: z.string().min(3).max(25).optional(),
  password: z.string().min(8).max(24).optional(),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
})


export type UserRegister = z.infer<typeof registerSchema>;

export type UserUpdate = z.infer<typeof updateSchema>

export type UserLogin = {
  email: string,
  password: string,
}

export type UserAuth = {
  id: string,
  username: string,
  email: string,
  hashedPassword: string,
  avatarUrl?: string,
}

export interface User {
  id: string,
  username: string,
  email: string,
  createdAt?: Date,
  hashedPassword?: string, 
  avatarUrl?:string,
}

export interface CreateUserRepository {
  username: string,
  hashedPassword: string,
  email: string,
  avatarUrl?: string;
}

export interface UpdateUserRepository{
  username?: string,
  email?: string,
  hashedPassword?: string
  avatarUrl?: string;
}


export const idSchema = z.object({
  id: z.uuid(),
})
