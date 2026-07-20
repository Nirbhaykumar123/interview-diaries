import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory rate limiting map
const rateLimitMap = new Map<string, RateLimitInfo>();

/**
 * Lightweight, dependency-free in-memory rate limiting middleware.
 * Prevents API abuse and spamming.
 */
export const rateLimiter = (options: {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum requests permitted in the window
  message: string;  // Error message sent on breach
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Fallback if IP detection is behind a proxy
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.method}:${req.path}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);

    // If no record exists or the window expired, initialize a new record window
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      rateLimitMap.set(key, record);
      return next();
    }

    record.count++;

    // Limit exceeded, return 429 Too Many Requests
    if (record.count > options.max) {
      res.status(429).json({
        status: 'error',
        message: options.message,
      });
      return;
    }

    next();
  };
};
