import { publicFetch, authFetch } from "../../../lib/api";


export async function createUser(userData: {email: string, username: string, password: string}){

  const data = await publicFetch("/users/", {
    method: "POST",
    body: userData,
  })

  return data.user;
}

export async function updateUser(userId: string, UserData: {email?: string, usernmae?: string, password?: string}){

  const data = await authFetch(`users/${userId}`, {
    body: UserData,
    method: "PATCH",
  })
  return data.user;
}

export async function getUser(userId: string){

  const data = await authFetch(`users/${userId}`);
  
  return data.user;
}


