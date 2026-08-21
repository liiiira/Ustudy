import { createUserRepository } from "../repositories/user.repository";
import { CreateUserInput } from "../schemas/user.schema";
import { hashPassword } from "../utils/password";

export async function createUserService(userData: CreateUserInput){

  const {username, email, password} = userData;
  const hashedPassword = await hashPassword(password);
  
  return await createUserRepository({
    username: username,
    hashedPassword: hashedPassword,
    email: email,
  });

} 
