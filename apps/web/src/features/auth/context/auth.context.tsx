import { useState } from "react";
import {AuthContext} from './auth.context.ts'
import * as authApi from '../api/auth.api.ts'

export function AuthProvider({children}: {children: React.ReactNode}){

  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (loginData: {email: string, password: string}) => {

    const token: string = await authApi.login(loginData);
    setAccessToken(token);
    setIsAuthenticated(true);
  }


  const logout = async() => {

    await authApi.logout();
    setAccessToken("");
    setIsAuthenticated(false);
  }

  return (
  <AuthContext.Provider value={{accessToken, isAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

