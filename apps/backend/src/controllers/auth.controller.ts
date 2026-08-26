import {type Response, type Request} from 'express';
import * as authService from '../services/auth.service.ts';
import { AppError } from '../errors/appError.ts';

export async function login(req: Request, res: Response){

  const {email, password} = req.body;
  const {refreshToken , accessToken }: {refreshToken: string, accessToken: string} = await authService.login({email, password});

  res.cookie('refreshToken', refreshToken, {
    secure: false, // for developement only
    httpOnly: true,
    sameSite: 'strict',
  })
  
  return res.status(200).json({
    status: 'success',
    message: 'Logged In Successfuly',
    accessToken: accessToken,
  })
} 

export async function refresh(req: Request, res: Response) {


  const refreshToken: string | undefined = req.cookies.refreshToken;

  if(!refreshToken)
    throw new AppError("Invalid Refresh Token", 401);

  const accessToken = await authService.refresh(refreshToken);

  return res.status(200).json({
    status: "success",
    message: "Access Token Refreshed",
    accessToken: accessToken
  })
}
