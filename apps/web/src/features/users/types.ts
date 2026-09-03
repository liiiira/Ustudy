export type User = {
  id: string;
  username: string;
  createdAt: Date;
  email: string;
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
