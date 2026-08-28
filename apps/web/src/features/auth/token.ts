let token: string | null = null;

export function setAccessToken(accessToken: string){
  token = accessToken;
}

export function getAccessToken(): string | null{
  return token;
}

export function removeAccessToken(){
  token = null;
}
