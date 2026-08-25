import * as userRepository from "../repositories/user.repository";
import { UserInput, User, UserUpdate } from "../schemas/user.schema";
import { hashPassword } from "../utils/password";
import { AppError } from "../errors/appError";

export async function create(userData: UserInput){

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


export async function findAll() : Promise<User[]>{
  return await userRepository.findAll(); 
}


export async function findByEmail(email: string) : Promise<User>{
  return await userRepository.findByEmail(email)
}


export async function findByUsername(username: string) : Promise<User> {
  return await userRepository.findByUsername(username);
}


export async function findById(id: string): Promise<User>{

  const user = await userRepository.findById(id);
  if (!user)
    throw new AppError("User Not Found", 404);
  return user;
}


export async function updateById(id: string, userData:UserUpdate) : Promise<User | null>{

  const {username, password, email} = userData;
  const user: User  = await findById(id);
 
  // check if email changed 
  const modifiedAttributes: Record<string, string> = {}
  if (email && user.email !== email){
    // check if the new email is used by anotehr user
    const emailExists = await findByEmail(email);
    if (emailExists)
      throw new AppError("New Email is Already Used", 409);
    modifiedAttributes["email"] = email;
  }

  // check if username changed
  if (username && user.username !== username){
    // check if the new usename  is used by another user
    const usernameExists: User = await findByUsername(username);
    if (usernameExists)
      throw new AppError("New Username Is Already Used", 409);
    modifiedAttributes["username"] = username;
  }
  if(password){
    const hashedPassword = await hashPassword(password);
    if(user.hashedPassword !== hashedPassword)
      modifiedAttributes["hashedPassword"] = hashedPassword;

  }
  
  // Check if nothing changed  
  if (modifiedAttributes.keys.length === 0)
    return null;

  const updatedUser: User = await userRepository.updateById(id, modifiedAttributes)
  
  if (!updatedUser)
    throw new AppError("User Was Not Updated", 500, "Uknown Failure");

  return updatedUser;
}

