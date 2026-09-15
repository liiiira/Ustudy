import { useState, useEffect } from "react";
import {AuthContext} from './auth.context.ts'
import * as authApi from '../api/auth.api.ts'
import { setAccessToken, removeAccessToken, getAccessToken } from "../token.ts";
import type { User } from "../../users/types.ts";
export function AuthProvider({children}: {children: React.ReactNode}){

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // On mount, the access token is gone (kept in memory only)
  // , but the httpOnly refresh-token cookie may still be valid 

  useEffect(() => {
    (async () => {
      try{
        const token: string = await authApi.refresh();
        setAccessToken(token);
        console.log("The acess token: ", getAccessToken())
        const user: User = await authApi.getMe();
        setUser(user);
        setIsAuthenticated(true);
      }catch{
        // no valid session to restore — stay logged out
      }finally{
        setLoading(false);
      }
    })();
  }, []);

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

