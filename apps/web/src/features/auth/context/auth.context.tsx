import { useState } from "react";
import {AuthContext} from './auth.context.ts'
import * as authApi from '../api/auth.api.ts'
import { setAccessToken, removeAccessToken } from "../token.ts";
import type { User } from "../../users/types.ts";
export function AuthProvider({children}: {children: React.ReactNode}){

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (loginData: {email: string, password: string}) => {
    
    setLoading(true);
    try{
    
      const token: string = await authApi.login(loginData);
      setAccessToken(token);
      const user: User = await authApi.getMe();    
      setUser(user);
      setIsAuthenticated(true);
  
    } finally{

      setLoading(false);
    }
      
  }


  const logout = async() => {

    setLoading(true);
    try{

      await authApi.logout();
      removeAccessToken();
      setIsAuthenticated(false);
      console.log("logout called")

    }finally{
      setLoading(false);
    }
  }

  return (
  <AuthContext.Provider value={{isAuthenticated, login, logout, loading, user}}>
      {children}
    </AuthContext.Provider>
  )
}

