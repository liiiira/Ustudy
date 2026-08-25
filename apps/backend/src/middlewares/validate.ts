import {type Request, type Response, type NextFunction} from 'express';
import { AppError } from '../errors/appError';
import {type ZodType } from 'zod';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {

    const result = schema.safeParse(req.body);
    
    if(!result.success)
      throw new AppError("Invalid Request Body", 400, result.error.issues)

    req.body = result.data;
    next();
  }
}

export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
   
    const result = schema.safeParse(req.params);
      
    if(!result.success)
      throw new AppError("Invalid Request Params", 400, result.error.issues)

    next();
  }
}
