import {z} from 'zod';

export const createUserSchema = z.object({

  username: z.string().min(3).max(50),
  password: z.string().min(8).max(24),
  email: z.email(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface CreateUserRepository {
  username: string,
  hashedPassword: string,
  email: string,
}

export interface CreateUserOutput {
  id: string,
  username: string,
  email: string,
  createdAt: Date,
}
