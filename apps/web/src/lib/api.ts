type OptionsType = {
  body?: Record<string, string>,
  method?: "POST" | "GET" | "PACTH" | "DELETE" | "PUT",
  queryParams?: Record<string, string>,
  accessToken?: string;
}


export async function fetchApi(endPointPath: string,options: OptionsType){

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
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if(!response.ok)
    throw new Error(`Failed to fetch ${endPointPath}`)

  return response.json();
}
