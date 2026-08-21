import { type RequestHandler, type Request, type Response, type NextFunction } from "express";

const asyncWrapper = (handler: RequestHandler): RequestHandler => {

  return (req: Request, res: Response, next: NextFunction)=>{
    return Promise.resolve(handler(req, res, next)).catch(next);
  }
}

export default asyncWrapper;
