import * as userRepository from "../repositories/user.repository";
import { CreateUserInput } from "../schemas/user.schema";
import { hashPassword } from "../utils/password";
import { AppError } from "../errors/appError";

export async function create(userData: CreateUserInput){

  const {username, email, password} = userData;

  // Check if email is already used
  const emailExists = await findByEmail(email);

  if (emailExists)
    throw new AppError("Email Already Exists", 409); 
  
  // Check if username is already used
  const usernameExists = await findByUsername(username);
  
  if (usernameExists)
      throw new AppError("Username Already Exists", 409);


  const hashedPassword = await hashPassword(password);
  
  return await userRepository.create({
    username: username,
    hashedPassword: hashedPassword,
    email: email,
  });
} 

export async function findAll(){
  return await userRepository.findAll(); 
}

export async function findByEmail(email: string){
  return await userRepository.findByEmail(email)
}

export async function findByUsername(username: string) {
  return await userRepository.findByUsername(username);
}

export async function findById(id: string){
  const user = await userRepository.findById(id);
  if (!user)
    throw new AppError("User Not Found", 404);
  return user;
}

