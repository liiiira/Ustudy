import { type CreateUserInput, CreateUserOutput } from "../schemas/user.schema.ts";
import * as userService from "../services/user.service.ts";
import {type Request, type Response} from 'express';

export async function create(req:Request, res: Response){
  
  // body Already validated
  const userData: CreateUserInput = req.body;

  // Getting the created user with his uuid, and time stamp of creation 
  const user: CreateUserOutput = await userService.create(userData);
  
  return res.status(201).json({

    status: "success",
    user: user,
    message: "User Created Successfuly"
  })
}

export async function getAll(_req: Request, res: Response){

  const users: CreateUserOutput[] = await userService.getAll();

  res.status(200).json({
    status: "success",
    users: users,
  })
}
