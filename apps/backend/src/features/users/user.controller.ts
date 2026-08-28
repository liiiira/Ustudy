import { type UserRegister, User, UserAuth } from "./user.schema.ts";
import * as userService from "./user.service.ts";
import {type Request, type Response} from 'express';

export async function create(req:Request, res: Response){
  
  // body Already validated using the validate middleware
  const userData: UserRegister = req.body;

  // Getting the created user with his uuid, and time stamp of creation 
  const user: User = await userService.create(userData);
  
  return res.status(201).json({

    status: "success",
    user: user,
    message: "User Created Successfuly"
  })
}

export async function findAll(_req: Request, res: Response){

  const users: User[] = await userService.findAll();

  return res.status(200).json({
    status: "success",
    users: users,
    message: "Users Returned Successfuly",
  })
}

export async function findById(req: Request<{ id: string} >, res: Response) {

  const {id} = req.params;
  const user = await userService.findById(id);

  return res.status(200).json({
    status: "success",
    user: user,
    message: "User Found Successfuly",
  });
}


export async function updateById(req: Request<{id: string}>, res: Response){

  const {id} = req.params;
  const {username, password, email } = req.body;
  const updatedUser: User | null = await userService.updateById(id, {username, password, email})

  // Nothing changed
  if (!updatedUser)
    return res.status(204).json({})

 
  return res.status(200).json({
    status: "success",
    user: updatedUser,
    message: "User Updated Successfully"
  })
}

export async function deleteById (req: Request<{id: string}>, res: Response){
  const {id} = req.params;
  
  const deletedUser: {id: string} = await userService.delelteById(id);

  return res.status(200).json({
    status: "success",
    message: "User Deleted Successfully",
    user: deletedUser,
  })
}
