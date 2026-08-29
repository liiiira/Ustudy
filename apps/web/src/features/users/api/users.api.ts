import { publicFetch, authFetch } from "../../../lib/api";
import { type User } from "../types.ts";

export async function createUser(userData: {email: string, username: string, password: string}): Promise<User>{

  const data = await publicFetch("/users/", {
    method: "POST",
    body: userData,
  })

  return data.user;
}

export async function updateUser(userId: string, UserData: {email?: string, usernmae?: string, password?: string}): Promise<User>{

  const data = await authFetch(`users/${userId}`, {
    body: UserData,
    method: "PATCH",
  })
  return data.user;
}

export async function getUser(userId: string): Promise<User>{

  const data = await authFetch(`users/${userId}`);
  
  return data.user;
}

export async function getProfile(): Promise<User>{
  const data = await authFetch("/users/me", {method: "GET"});
  console.log("Profile: ", data.user)
  return data.user;
}
