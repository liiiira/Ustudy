import { publicFetch } from "../../../lib/api";

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
