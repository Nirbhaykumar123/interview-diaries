/**
 * Unit Tests: Token Utilities
 *
 * WHY TEST PURE FUNCTIONS FIRST?
 * Token generation and verification are the foundation of authentication security.
 * These are pure functions with no side effects — the easiest and highest-value tests to write.
 *
 * These tests verify:
 * 1. Access tokens contain the correct payload (userId, role)
 * 2. Access tokens expire (we can't easily test 15m expiry, but we test structure)
 * 3. Tampered tokens are rejected
 * 4. Refresh token strings have sufficient entropy
 * 5. SHA-256 hashing is deterministic and one-way
 */

import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashTokenString,
  verifyAccessToken,
} from '@/utils/tokens';

// We need the secret to decode tokens in tests
process.env.JWT_ACCESS_SECRET = 'test_secret_for_unit_tests_only_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32chars_long!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

describe('generateAccessToken()', () => {
  it('returns a string', () => {
    const token = generateAccessToken('user-id-123', 'USER');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('embeds the correct userId (sub) in the payload', () => {
    const userId = 'abc-123-def-456';
    const token = generateAccessToken(userId, 'USER');
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(userId);
  });

  it('embeds the correct role in the payload', () => {
    const token = generateAccessToken('user-id', 'ADMIN');
    const decoded = verifyAccessToken(token);
    expect(decoded.role).toBe('ADMIN');
  });

  it('produces a token with 3 JWT segments separated by dots', () => {
    const token = generateAccessToken('user-id', 'USER');
    const segments = token.split('.');
    expect(segments).toHaveLength(3);
  });
});

describe('verifyAccessToken()', () => {
  it('returns the payload for a valid token', () => {
    const token = generateAccessToken('test-user', 'MODERATOR');
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('test-user');
    expect(payload.role).toBe('MODERATOR');
  });

  it('throws for a tampered token', () => {
    const token = generateAccessToken('user-id', 'USER');
    // Corrupt the signature (last segment)
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.corrupted_signature`;

    expect(() => verifyAccessToken(tamperedToken)).toThrow();
  });

  it('throws for a token signed with a different secret', () => {
    // Sign with a different secret
    const wrongSecretToken = jwt.sign({ sub: 'user', role: 'USER' }, 'WRONG_SECRET', {
      expiresIn: '15m',
    });

    expect(() => verifyAccessToken(wrongSecretToken)).toThrow();
  });

  it('throws for a completely invalid string', () => {
    expect(() => verifyAccessToken('not.a.valid.jwt')).toThrow();
    expect(() => verifyAccessToken('')).toThrow();
    expect(() => verifyAccessToken('random-garbage')).toThrow();
  });
});

describe('generateRefreshTokenString()', () => {
  it('returns a string of 128 characters (64 bytes as hex)', () => {
    const token = generateRefreshTokenString();
    expect(token).toHaveLength(128);
  });

  it('returns only hexadecimal characters', () => {
    const token = generateRefreshTokenString();
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it('generates unique tokens on every call', () => {
    const token1 = generateRefreshTokenString();
    const token2 = generateRefreshTokenString();
    const token3 = generateRefreshTokenString();
    // Probability of collision is astronomically small (512 bits of entropy)
    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
  });
});

describe('hashTokenString()', () => {
  it('returns a 64-character hex string (SHA-256 output)', () => {
    const hash = hashTokenString('any-input-string');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('is deterministic — same input always produces same output', () => {
    const input = 'consistent-input-token';
    const hash1 = hashTokenString(input);
    const hash2 = hashTokenString(input);
    expect(hash1).toBe(hash2);
  });

  it('is collision-resistant — different inputs produce different hashes', () => {
    const hash1 = hashTokenString('token-a');
    const hash2 = hashTokenString('token-b');
    expect(hash1).not.toBe(hash2);
  });

  it('is one-way — cannot reverse the hash to get the original token', () => {
    // This is not a mathematical proof, but it documents the intent.
    // The hash should look nothing like the input.
    const input = 'my-secret-refresh-token';
    const hash = hashTokenString(input);
    expect(hash).not.toContain(input);
    expect(hash).not.toBe(input);
  });
});
