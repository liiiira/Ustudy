import * as userRepository from "./user.repository";
import * as uploadService from "../uploads/upload.service.ts";
import type { UserRegister, User, UserUpdate, UserAuth } from "./user.schema";
import { hashPassword } from "../../utils/password";
import { AppError } from "../../errors/appError";

export async function create(userData: UserRegister): Promise<User> {
  const { username, email, password } = userData;

  // Check if email is already used
  const emailExists: User | null = await findByEmail(email);

  if (emailExists) throw new AppError("Email Already Exists", 409);

  // Check if username is already used
  const usernameExists: User | null = await findByUsername(username);

  if (usernameExists) throw new AppError("Username Already Exists", 409);

  const hashedPassword = await hashPassword(password);

  return await userRepository.create({
    username: username,
    hashedPassword: hashedPassword,
    email: email,
  });
}

export async function findAll(): Promise<User[]> {
  return await userRepository.findAll();
}

export async function findByEmail(email: string): Promise<UserAuth | null> {
  return await userRepository.findByEmail(email);
}

export async function findByUsername(
  username: string,
): Promise<UserAuth | null> {
  return await userRepository.findByUsername(username);
}

export async function findById(id: string): Promise<UserAuth> {
  const user = await userRepository.findById(id);

  if (!user) throw new AppError("User Not Found", 404);

  return user;
}

export async function findExistingIds(userIds: string[]): Promise<string[]> {
  const existingIds: string[] = await userRepository.findExistingIds(userIds);

  return existingIds;
}

export async function updateById(
  requesterId: string,
  id: string,
  userData: UserUpdate,
): Promise<User | null> {
  const { username, password, email, avatarUrl } = userData;
  const user: User = await findById(id);

  if (requesterId !== id)
    throw new AppError("You are not allowed to update this user", 403);

  if (!username && !password && !email && !avatarUrl)
    throw new AppError("Body is Empty", 400);

  const modifiedAttributes: Record<string, string> = {};

  // Check if email exists and changed
  if (email && user.email !== email) {
    // Check if the new email is used by anotehr user
    const emailExists = await findByEmail(email);

    if (emailExists) throw new AppError("New Email is Already Used", 409);

    modifiedAttributes["email"] = email;
  }

  // check if username changed
  if (username && user.username !== username) {
    // check if the new usename  is used by another user
    const usernameExists: User | null = await findByUsername(username);

    if (usernameExists) throw new AppError("New Username Is Already Used", 409);

    modifiedAttributes["username"] = username;
  }

  // check if the avatar changed
  if (avatarUrl && user.avatarUrl !== avatarUrl) {
    const upload = await uploadService.verifyUploadOwnerShip(requesterId, {
      avatarUrl,
    });
    modifiedAttributes["uploadId"] = upload.id;
  }

  if (password) {
    const hashedPassword = await hashPassword(password);

    if (user.hashedPassword !== hashedPassword)
      modifiedAttributes["hashedPassword"] = hashedPassword;
  }

  // Check if nothing changed
  if (Object.keys(modifiedAttributes).length === 0) return null;

  const updatedUser: User = await userRepository.updateById(
    id,
    modifiedAttributes,
  );

  if (!updatedUser)
    throw new AppError("User Was Not Updated", 500, "Uknown Failure");

  return updatedUser;
}

export async function delelteById(requesterId: string, id: string) {
  // check existence before ownership, same order as updateById/post.service/comment.service
  await findById(id);

  if (requesterId !== id)
    throw new AppError("You are not allowed to delete this user", 403);

  const user: { id: string } | null = await userRepository.deleteById(id);

  if (!user) throw new AppError("User Not Found", 404);

  return user;
}
