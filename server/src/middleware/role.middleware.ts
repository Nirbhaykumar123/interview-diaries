import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

/**
 * Middleware to restrict route access to specific user roles.
 * Must be mounted AFTER the authenticate middleware.
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    
    next();
  };
};
