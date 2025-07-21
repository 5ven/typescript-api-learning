import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/response.types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  // Handle specific error types
  if (error.message.includes('already exists')) {
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    message = error.message;
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorCode = 'RESOURCE_NOT_FOUND';
    message = error.message;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message
    },
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(errorResponse);
};
