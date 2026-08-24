import { type RequestHandler } from "express";

function asyncWrapper<P extends Record<string, string>>(handler: RequestHandler<P>): RequestHandler<P>  {

  return (req, res, next)=>{
    return Promise.resolve(handler(req, res, next)).catch(next);
  }
}

export default asyncWrapper;
