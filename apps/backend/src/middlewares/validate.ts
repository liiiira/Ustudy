import {type Request, type Response, type NextFunction} from 'express';
import { AppError } from '../errors/appError';
import { ZodSchema } from 'zod/v3';

export default function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {

    const result = schema.safeParse(req.body);
    
    if(!result.success)
      throw new AppError("Invalid Request Body", 400)

    req.body = result.data;
    next();
  }
}
