import { type CreateUserInput, CreateUserOutput } from "../schemas/user.schema.ts";
import { createUserService } from "../services/user.service.ts";
import { createUserSchema } from "../schemas/user.schema";
import {type Request, type Response} from 'express';
import { AppError } from "../errors/appError";

export async function handleCreateUser(req: Request, res: Response){
  
  //validating the format of the userData to create
  const result = createUserSchema.safeParse(req.body);
  
  if(!result.success)
    throw new AppError("Invalid User Input", 401);

  const userData: CreateUserInput = result.data;

  // Getting the created user with his uuid, and time stamp of creation 
  const user: CreateUserOutput = await createUserService(userData);
  
  return res.status(201).json({
    status: "success",
    user: user,
    message: "User Created Successfuly"
  })
}
