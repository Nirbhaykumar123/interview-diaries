import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

// Express global error handling middleware has 4 arguments.
// The presence of '_next' in the signature is required for Express to recognize it.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If the error is a known operational error from our AppError classes
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Prisma connection or validation errors if any leak through
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      status: 'error',
      message: 'Database operation failed due to a constraint violation.',
    });
    return;
  }

  // Log unexpected errors for monitoring
  console.error('🔥 Unexpected Error:', err);

  // Return a generic error in production to hide internal implementation details
  const message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;

  res.status(500).json({
    status: 'error',
    message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
