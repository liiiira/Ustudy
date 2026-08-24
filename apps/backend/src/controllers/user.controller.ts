import { type CreateUserInput, CreateUserOutput } from "../schemas/user.schema.ts";
import * as userService from "../services/user.service.ts";
import {type Request, type Response} from 'express';

export async function create(req:Request, res: Response){
  
  // body Already validated using the validate middleware
  const userData: CreateUserInput = req.body;

  // Getting the created user with his uuid, and time stamp of creation 
  const user: CreateUserOutput = await userService.create(userData);
  
  return res.status(201).json({

    status: "success",
    user: user,
    message: "User Created Successfuly"
  })
}

export async function findAll(_req: Request, res: Response){

  const users: CreateUserOutput[] = await userService.findAll();

  res.status(200).json({
    status: "success",
    users: users,
  })
}

export async function findById(req: Request<{ id: string} >, res: Response) {

  const {id} = req.params;
  const user = await userService.findById(id);

  res.status(200).json({
    status: "success",
    user: user,
  });
}
