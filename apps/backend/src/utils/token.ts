import jwt from 'jsonwebtoken';
import { type JwtPayload } from 'jsonwebtoken';
import { AppError } from '../errors/appError';
import crypto from 'node:crypto'

const ACCESS_SECRET: string = process.env.ACCESS_SECRET!;
const REFRESH_SECRET: string = process.env.REFRESH_SECRET!;

export function createRefreshToken(userId: string): string{
  
  return jwt.sign(
    {
      userId: userId
    },
    REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  );
}

export function verifyRefreshToken(refreshToken: string): JwtPayload{
  try{
    const payload =  jwt.verify(refreshToken, REFRESH_SECRET);
    if (typeof payload === "string") {
      throw new AppError("Invalid refresh token", 401);
    }
    return payload;  

  }catch(error){
    throw new AppError("Invalid Refresh Token", 401);
  }
}

export function createAccessToken(userId: string): string{
  
  return jwt.sign(
    {
      userId: userId
    },
    ACCESS_SECRET,
    {
      expiresIn: "15m"
    }
  );
}
export function verifyAccessToken(accessToken: string): JwtPayload{
  try{
    const payload =  jwt.verify(accessToken, REFRESH_SECRET);
    if (typeof payload === "string") {
      throw new AppError("Invalid refresh token", 401);
    }
    return payload;  

  }catch(error){
    throw new AppError("Invalid Refresh Token", 401);
  }
}

export function hashRefreshToken(refreshToken: string): string{
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
}

export function compareRefreshToken(refreshToken: string, hashedRefreshToken: string): boolean{

  const incomingHash = Buffer.from(hashRefreshToken(refreshToken), "hex");
  const storedHash = Buffer.from(hashedRefreshToken, "hex");
  return crypto.timingSafeEqual(incomingHash, storedHash);
}
