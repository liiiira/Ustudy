import {type Response, type Request} from 'express';
import * as authService from './auth.service.ts';
import { AppError } from '../../errors/appError.ts';

export async function login(req: Request, res: Response){


  const {email, password} = req.body;
  // Login and get
  // a short life Access token for api requests 
  // and a long life  refreshToken to refresh the access Token
  const {refreshToken , accessToken }: {refreshToken: string, accessToken: string} = 
    await authService.login({email, password});

  res.cookie('refreshToken', refreshToken, {
    secure: false, // for developement only
    httpOnly: true,
    sameSite: 'strict',
  });
  
  return res.status(200).json({
    status: 'success',
    message: 'Logged In Successfuly',
    accessToken: accessToken,
  });
} 

export async function refresh(req: Request, res: Response) {
  
  // Check if he has a refresh token cookie
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if(!refreshToken)
    throw new AppError("Invalid Refresh Token", 401);

  // Produce a new access token if the refresh  token is valid
  const accessToken = await authService.refresh(refreshToken);

  return res.status(200).json({
    status: "success",
    message: "Access Token Refreshed",
    accessToken: accessToken
  });
}


export async function logout(req: Request, res: Response){

  // Check if the user has refresh token as cookie
  const refreshToken: string | undefined = req.cookies.refreshToken;
  
  if(!refreshToken)
    throw new AppError("Invalid Refresh Token", 401);
  
  // Revoke his token by setting it in the database
  await authService.revokeRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  return res.sendStatus(204);
}
