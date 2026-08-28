import { useState } from "react";
import {AuthContext} from './auth.context.ts'
import * as authApi from '../api/auth.api.ts'
import { setAccessToken, removeAccessToken } from "../token.ts";

export function AuthProvider({children}: {children: React.ReactNode}){

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (loginData: {email: string, password: string}) => {

    const token: string = await authApi.login(loginData);
    setAccessToken(token);
    setIsAuthenticated(true);
  }


  const logout = async() => {

    await authApi.logout();
    removeAccessToken();
    setIsAuthenticated(false);
  }

  return (
  <AuthContext.Provider value={{isAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

