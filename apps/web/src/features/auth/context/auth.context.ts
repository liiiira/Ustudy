import { createContext } from "react";
import { type User } from "../../users/types";

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (data: {email: string, password: string}) => Promise<void>;
  logout: () => Promise<void>;

}

export const AuthContext = createContext<AuthContextType | null>(null);
