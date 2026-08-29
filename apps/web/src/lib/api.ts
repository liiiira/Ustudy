import { getAccessToken, setAccessToken } from "../features/auth/token";

type PublicOptionsType = {
  body?: Record<string, string>,
  method?: "POST" | "GET" | "PATCH" | "DELETE" | "PUT",
  queryParams?: Record<string, string>, 
}

type OptionsType = PublicOptionsType & {
  accessToken?: string | null;
}

type ErrorResponse = {
  status: string;
  message: string;
}

export async function publicFetch(endPointPath: string, options?: PublicOptionsType){

  options = options ?? {}
  const response =  await fetchApi(endPointPath, false,  options)

  if(!response.ok){
    const errorData = await response.json() as ErrorResponse;
    throw new Error(errorData.message)
  }

  return response.json();

}

export async function authFetch(endPointPath: string, options?: PublicOptionsType){
  
  const accessToken: string | null = getAccessToken();
  const response = await fetchApi(endPointPath, true, {...options, accessToken})
  
  if(response.ok)
    return response.json();

  // if the request was not authorized 
  if(response.status === 401){

    // refresh access token 
    const data: {message: string, status: string, accessToken: string} = await publicFetch("/auth/refresh", {
      method: "POST",
    })
    
    setAccessToken(data.accessToken);

    // retry again 
    const newResponse = await fetchApi(endPointPath, true, {...options, accessToken: data.accessToken})
  
    if(newResponse.ok)
      return response.json();
    
    const newErrorData = await newResponse.json() as ErrorResponse;
    
    throw new Error(newErrorData.message);
  }
  
  const errorData = await response.json() as ErrorResponse;

  throw new Error(errorData.message);

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
  return response;
}


