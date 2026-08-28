import { fetchApi } from "../../../lib/api";


export async function login(userInfo: {email: string, password: string}): Promise<string>{
  const data = await fetchApi("/auth/login", 
    {
      method: 'POST',
      body: userInfo
    }
  );
  
  return data.accessToken;
}

export async function refresh(): Promise<string>{
  const data = await fetchApi("/auth/refresh",
    {
      method: "POST",
    }
  );
  return data.accessToken;
}

export async function logout(): Promise<void>{
   await fetchApi("/auth/logout", 
    {
      method: "POST",
    }
  );

  return;
}
