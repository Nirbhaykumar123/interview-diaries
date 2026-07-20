import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { UnauthorizedError } from '../utils/errors';

/**
 * Express middleware to protect routes. Parses Bearer JWT access tokens
 * from the Authorization header and attaches the parsed payload to the request object.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is missing');
    }

    // Verify cryptographic signature and expiry window
    const decoded = verifyAccessToken(token);

    // Attach decoded user payload to request context
    (req as any).user = decoded;

    next();
  } catch (error) {
    // Catch token expired/invalid signatures and pass to global error handler
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};

/**
 * Optional authentication middleware. Decodes user tokens if present,
 * but proceeds silently if headers are missing.
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
  } catch (error) {
    // Fail silently on invalid tokens in optional auth paths
  }
  
  next();
};
