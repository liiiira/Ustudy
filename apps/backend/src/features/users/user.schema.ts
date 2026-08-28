import {z} from 'zod';

export const registerSchema = z.object({

  username: z.string().min(3).max(25),
  password: z.string().min(8).max(24),
  email: z.email(),
})

export type UserRegister = z.infer<typeof registerSchema>;

export const idSchema = z.object({
  id: z.uuid(),
})


export const updateSchema = z.object({
  username: z.string().min(3).max(25).optional(),
  password: z.string().min(8).max(24).optional(),
  email: z.email().optional(),
})

export type UserUpdate = z.infer<typeof updateSchema>

export interface UserLogin{
  email: string,
  password: string,
}

export interface UserAuth{
  id: string,
  username: string,
  email: string,
  hashedPassword: string,
}

export interface User {
  id: string,
  username: string,
  email: string,
  createdAt?: Date,
  hashedPassword?: string, 
}


export interface CreateUserRepository {
  username: string,
  hashedPassword: string,
  email: string,
}

export interface UpdateUserRepository{
  username?: string,
  email?: string,
  hashedPassword?: string
}


