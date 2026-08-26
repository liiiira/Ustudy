import { AppError } from "../errors/appError.ts";
import { UserLogin, UserAuth } from "../schemas/user.schema";
import * as userService from "../services/user.service.ts"
import { comparePassword } from "../utils/password.ts";
import * as tokenUtils from '../utils/token.ts'
import * as authRepository from '../repositories/auth.repository.ts'


export async function login(userData: UserLogin): Promise<{refreshToken: Promise<string>, accessToken: string}>{

  const {email, password} = userData;

  // get the user based on the email
  const user: UserAuth | null = await userService.findByEmail(email);

  if(!user)
    throw new AppError("Invalid Cridentials", 401);
  
  const {hashedPassword, id} = user;
  
  // check if the password is correct
  const validPassword: boolean = await comparePassword(password, hashedPassword);

  if(!validPassword)
    throw new AppError("Invalid Cridentials", 401);

  // create both access and refresh tokens
  const refreshToken: Promise<string> = updateRefreshToken(id);
  const accessToken: string = createAccessToken(id);

  return {accessToken, refreshToken}
}

async function updateRefreshToken(userId: string): Promise<string>{

  const refreshToken = tokenUtils.createRefreshToken(userId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const hashedToken = tokenUtils.hashRefreshToken(refreshToken);
  const token = await  authRepository.upsertRefreshToken({userId, expiresAt, hashedToken});

  if(!token)
    throw new AppError("Unexpected Database Error" , 500);

  return refreshToken;
}

function createAccessToken(userId: string): string{
  return tokenUtils.createAccessToken(userId);
}

