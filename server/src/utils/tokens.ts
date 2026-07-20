import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

/**
 * Sign a stateless, short-lived JWT access token.
 * Expired tokens will throw an exception during verification.
 */
export const generateAccessToken = (userId: string, role: string): string => {
  const payload: AccessTokenPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m', // 15 minutes expiration window
  });
};

/**
 * Generate a cryptographically secure random string to use as a refresh token.
 * A 64-byte hex string has 128 characters, yielding 512 bits of entropy,
 * which is mathematically impossible to guess.
 */
export const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a token string using SHA-256 before database storage.
 * This guarantees that even if the database is breached, the attacker
 * cannot forge session cookies since SHA-256 is a one-way cryptographic hash function.
 */
export const hashTokenString = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify an access token's cryptographic signature and return the parsed payload.
 * Throws an error if expired or tampered with.
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};
