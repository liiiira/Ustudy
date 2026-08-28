import { getAccessToken } from "../features/auth/token";

type PublicOptionsType = {
  body?: Record<string, string>,
  method?: "POST" | "GET" | "PATCH" | "DELETE" | "PUT",
  queryParams?: Record<string, string>, 
}
type OptionsType = PublicOptionsType & {
  accessToken?: string | null;
}

export async function publicFetch(endPointPath: string, options: PublicOptionsType){
  return await fetchApi(endPointPath, false,  options)
}

export async function authFetch(endPointPath: string, options: PublicOptionsType){

  const accessToken: string | null = getAccessToken();
  return await fetchApi(endPointPath, true, {...options, accessToken})
}

async function fetchApi(endPointPath: string, auth: boolean = false , options: OptionsType){

  const params = options.queryParams ?? null;

  const queryParams: string = ''

  if(params){
    for (const key of params.keys)
      queryParams.concat(`${key}=${params[key]}`);
  }
   
  const accessToken: string = options.accessToken ?? "";

  const body = options.body ? JSON.stringify(options.body) : null;

  const remainingOptions = {
    body: body,
    method: options.method ?? "GET",
  }
  
  const response = await fetch(`http://localhost:3000/api/v1${endPointPath}?${queryParams}`, {
    ...remainingOptions,
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...(auth && {'Authorization': `Bearer ${accessToken}`,
      }),
    }
  });

  if(!response.ok)
    throw new Error(`Failed to fetch ${endPointPath}`)

  return response.json();
}


