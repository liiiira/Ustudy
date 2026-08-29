import { createContext } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: {email: string, password: string}) => Promise<void>;
  logout: () => Promise<void>;

}

export const AuthContext = createContext<AuthContextType | null>(null);
