import { authFetch, publicFetch } from "../../../lib/api";
import { type User } from "../../users/types";

export async function login(userInfo: {email: string, password: string}): Promise<string>{
  const data = await publicFetch("/auth/login", 
    {
      method: 'POST',
      body: userInfo
    }
  );
  
  return data.accessToken;
}

export async function refresh(): Promise<string>{
  const data = await publicFetch("/auth/refresh",
    {
      method: "POST",
    }
  );
  return data.accessToken;
}

export async function logout(): Promise<void>{
   await publicFetch("/auth/logout", 
    {
      method: "POST",
    }
  );

  return;
}

export async function getMe(): Promise<User>{
  const data = await authFetch("/users/me", 
    {
      method: "GET",
    }
  );
  return data.user;
}
