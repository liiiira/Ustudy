
export class AppError extends Error {

  public readonly statusCode: number;
  // isOperational flag to indicate that this error was thrown by the program and not an unexpected bug
  public readonly isOperational: boolean; 
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any ){

    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.details = details;
  
  }
}


