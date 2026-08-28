import { AppError } from "../../errors/appError.ts";
import { UserLogin, UserAuth } from "../users/user.schema";
import * as userService from "../users/user.service.ts"
import { comparePassword } from "../../utils/password.ts";
import * as tokenUtils from '../../utils/token.ts'
import * as authRepository from './auth.repository.ts'
import { JwtPayload } from "jsonwebtoken";


export async function login(userData: UserLogin): Promise<{refreshToken: string, accessToken: string}>{

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
  const refreshToken = await updateRefreshToken(id);
  const accessToken: string = createAccessToken(id);

  return {accessToken, refreshToken}
}


export async function refresh(refreshToken: string): Promise<string>{
  
  // verify it's a valid refersh token
  const payload: JwtPayload = tokenUtils.verifyRefreshToken(refreshToken);

  // fetch the refresh token associated with the user
  const userRefreshToken: {hashedToken: string, userId: string, expiresAt: Date, revokedAt: Date, id: Date}
    = await authRepository.findRefreshToken(payload.userId);
 
  // check if the token expired or got revoked
  if(userRefreshToken.revokedAt || userRefreshToken.expiresAt < new Date())
    throw new AppError("Invalid refreshToken", 401);

  // check if the token sent is the same one stored in the database
  const validToken: boolean = tokenUtils.compareRefreshToken(refreshToken, userRefreshToken.hashedToken);
  
  if (!validToken)
     throw new AppError("Invalid refreshToken", 401);  
  
  return createAccessToken(userRefreshToken.userId);
}


export async function revokeRefreshToken (refreshToken: string){
  
  // Check if it is a valid refresh token
  const payload: JwtPayload = tokenUtils.verifyRefreshToken(refreshToken);

  // hash it and revoke the refresh token that has the same hash  
  const hashedRefreshToken: string = tokenUtils.hashRefreshToken(refreshToken);
  const result: {id: string, userId: string} = await authRepository.revokeRefreshToken(hashedRefreshToken)

  if (!result)
    throw new AppError("Token was not found in DB", 500);
  
  // Contains token id and user id (not used for now)
  return result;
}


async function updateRefreshToken(userId: string): Promise<string>{
  
  // creating a refresh token associated to a user (for now)
  const refreshToken = tokenUtils.createRefreshToken(userId);

  // Calculating the expire date of the token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // hash the token and store it in db
  const hashedToken = tokenUtils.hashRefreshToken(refreshToken);
  const token = await  authRepository.upsertRefreshToken({userId, expiresAt, hashedToken});

  if(!token)
    throw new AppError("Unexpected Database Error" , 500);

  return refreshToken;
}


function createAccessToken(userId: string): string{
  return tokenUtils.createAccessToken(userId);
}




 

