import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";
import { verifyAccessToken} from "../utils/token";
import { JwtPayload } from "jsonwebtoken";

export default function isAuthenticated(req: Request, res: Response, next: NextFunction) {

  const authHeader: string | undefined = req.headers["authorization"];

  if(!authHeader)
    throw new AppError("Not Authorized", 401);
  
  // Check if it has the format:  Bearer <access token>
  const [scheme, token] = authHeader.split(" ");

  if(scheme !== "Bearer" || !token)
     throw new AppError("Not authorized", 401);

  const payload: JwtPayload = verifyAccessToken(token);
  
  const {sub} = payload;

  if(!sub)
    throw new AppError("Not authorized", 401);

  req.user = {id: sub};
  
  next();
}
