export type User = {
  id: string;
  username: string;
  createdAt: Date;
  email: string;
  avatarUrl?: string;
}

export type SignupUser = {
  username: string,
  password: string,
  email: string,
}

export type SignupError = {
  username: string[];
  password: string[];
  email: string[];
}

export type UpdateUserAccount = {
  username: string;
  avatarUrl?: string;
}

export type UpdateUserAccountErrors = {
  username: string[];
}

export type ActiveIdType = "account" | "security"
export const ACTIVE_IDS = ["account" , "security"] as const;
