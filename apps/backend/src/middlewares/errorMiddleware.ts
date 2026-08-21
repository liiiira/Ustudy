import  {type Request, type Response, type NextFunction} from 'express';
import { AppError } from '../errors/appError';


const errorMiddleware = (err: Error, _req: Request, res : Response , _next: NextFunction) => {

  console.error(err);
  
  // Explcitly thrown error by the application
  if (err instanceof AppError && err.isOperational){
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }
  
  // Unexpected error (bug or something similar)
  return res.status(500).json({
    status: "error", 
    message: "Internal server error"
  })
}

export default errorMiddleware;
