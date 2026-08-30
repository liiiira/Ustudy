import {z} from 'zod';

export const loginSchema = z.object({

  password: z.string().min(8).max(24),
  email: z.email(),

})




