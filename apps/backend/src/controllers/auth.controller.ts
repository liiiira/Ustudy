import {type Response, type Request} from 'express';
import * as authService from '../services/auth.service.ts';

export async function login(req: Request, res: Response){

  const {email, password} = req.body;
  const {refreshToken , accessToken }: {refreshToken: Promise<string>, accessToken: string} = await authService.login({email, password});

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
