import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { createUser } from '../helpers/factories';
import { testPrisma } from '../helpers/setup';

// ── Helper: register a user via NITC email and return response ─────────────────

let registerCounter = 100000;
async function registerUser(overrides: Record<string, unknown> = {}) {
  const counter = ++registerCounter;
  const rollNumber = `b220${String(counter).slice(-3)}`;
  return request(app)
    .post('/api/auth/register')
    .send({
      email: `student${counter}_${rollNumber}cs@nitc.ac.in`,
      username: `student${counter}`,
      password: 'Secure123!',
      fullName: 'Test Student',
      course: 'BTECH',
      branch: 'CSE',
      graduationYear: 2026,
      ...overrides,
    });
}

// Helper to register, manually verify in DB, and log in to get tokens/cookies
async function registerAndVerifyUser(overrides: Record<string, unknown> = {}) {
  const regRes = await registerUser(overrides);
  if (regRes.status !== 201) {
    throw new Error(`Registration failed in test helper: ${JSON.stringify(regRes.body)}`);
  }
  
  await testPrisma.user.update({
    where: { email: regRes.body.data.user.email },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    }
  });

  return request(app)
    .post('/api/auth/login')
    .send({
      email: regRes.body.data.user.email,
      password: overrides.password as string || 'Secure123!'
    });
}

// ── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('201 — creates user in unverified state and returns safe user object', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toMatch(/verify/i);
    expect(res.body.data.user.email).toBeDefined();
    
    // Check database state
    const dbUser = await testPrisma.user.findUnique({
      where: { email: res.body.data.user.email }
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.isEmailVerified).toBe(false);
    expect(dbUser?.emailVerificationToken).toBeDefined();

    // Verify password hash is NEVER returned
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('201 — does NOT set cookies or accessToken on register', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeUndefined();
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('409 — conflicts when email is already registered', async () => {
    const counter = ++registerCounter;
    const rollNumber = `b220${String(counter).slice(-3)}`;
    const email = `student${counter}_${rollNumber}cs@nitc.ac.in`;
    await registerUser({ email });

    const res = await registerUser({ email, username: `other${counter}` });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('409 — conflicts when username is already taken', async () => {
    const counter = ++registerCounter;
    const username = `studenttaken${counter}`;
    await registerUser({ username });

    const rollNumber = `b220${String(counter).slice(-3)}`;
    const res = await registerUser({ username, email: `studentother${counter}_${rollNumber}cs@nitc.ac.in` });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken/i);
  });

  it('400 — rejects invalid email format', async () => {
    const res = await registerUser({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('400 — rejects email from non-NITC domain', async () => {
    const res = await registerUser({ email: 'nirbhay@gmail.com' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(/Only verified NIT Calicut student emails/i);
  });

  it('400 — rejects password without uppercase letter', async () => {
    const res = await registerUser({ password: 'alllowercase1' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('400 — rejects password shorter than 8 characters', async () => {
    const res = await registerUser({ password: 'Ab1!' });
    expect(res.status).toBe(400);
  });

  it('400 — rejects username with special characters', async () => {
    const res = await registerUser({ username: 'invalid-user!' });
    expect(res.status).toBe(400);
  });

  it('400 — rejects missing fullName', async () => {
    const counter = ++registerCounter;
    const rollNumber = `b220${String(counter).slice(-3)}`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `student${counter}_${rollNumber}cs@nitc.ac.in`,
        username: `student${counter}`,
        password: 'Secure123!',
        course: 'BTECH',
        branch: 'CSE',
        graduationYear: 2026,
      });
    expect(res.status).toBe(400);
  });

  it('400 — rejects registration if graduation year does not match email roll number admission year', async () => {
    const res = await registerUser({ graduationYear: 2029 }); // expected 2026 for b220
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(/does not match your student email/i);
  });
});

// ── POST /api/auth/verify-email ──────────────────────────────────────────────

describe('POST /api/auth/verify-email', () => {
  it('200 — activates account when correct token is supplied', async () => {
    const regRes = await registerUser();
    const dbUserBefore = await testPrisma.user.findUnique({
      where: { email: regRes.body.data.user.email }
    });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: dbUserBefore?.emailVerificationToken });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified successfully/i);

    const dbUserAfter = await testPrisma.user.findUnique({
      where: { email: regRes.body.data.user.email }
    });
    expect(dbUserAfter?.isEmailVerified).toBe(true);
    expect(dbUserAfter?.emailVerificationToken).toBeNull();
  });

  it('401 — rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: 'invalid_verification_token' });

    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('200 — returns accessToken for valid credentials', async () => {
    const counter = ++registerCounter;
    const rollNumber = `b220${String(counter).slice(-3)}`;
    const email = `studentlogin${counter}_${rollNumber}cs@nitc.ac.in`;
    const password = 'Secure123!';
    
    // Register
    await registerUser({ email, password });

    // Try login (should fail because not verified)
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(failRes.status).toBe(403);
    expect(failRes.body.message).toMatch(/verify your email/i);

    // Verify manually
    await testPrisma.user.update({
      where: { email },
      data: { isEmailVerified: true }
    });

    // Try login again
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
  });

  it('401 — wrong password returns error without leaking details', async () => {
    const counter = ++registerCounter;
    const rollNumber = `b220${String(counter).slice(-3)}`;
    const email = `studentwrongpass${counter}_${rollNumber}cs@nitc.ac.in`;
    await registerUser({ email });
    await testPrisma.user.update({
      where: { email },
      data: { isEmailVerified: true }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword9!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('401 — unregistered email returns same generic error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody_b230000ec@nitc.ac.in', password: 'Secure123!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('403 — suspended user cannot log in', async () => {
    const suspendedUser = await createUser({ isSuspended: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: suspendedUser.email, password: 'Secure123!' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/suspended/i);
  });

  it('400 — rejects missing email field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Secure123!' });

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('200 — issues new accessToken when valid cookie is present', async () => {
    // Step 1: Register and login to get valid refresh cookie
    const registerRes = await registerAndVerifyUser();
    const cookies = registerRes.headers['set-cookie'];

    // Step 2: Use the cookie to refresh
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('401 — no cookie returns unauthorized', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
  });

  it('401 — invalid/garbage cookie value is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=garbage_invalid_token_string');

    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('200 — clears cookie and returns success', async () => {
    const registerRes = await registerAndVerifyUser();
    const cookies = registerRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
    
    const clearCookie = (Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie'] || '']
    ).find((c: string) => c.startsWith('refreshToken='));
    expect(clearCookie).toBeDefined();
  });

  it('200 — gracefully handles missing cookie (already logged out)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('200 — returns user data for a valid access token', async () => {
    const registerRes = await registerAndVerifyUser();
    const { accessToken } = registerRes.body.data;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('401 — missing Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 — malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.jwt');

    expect(res.status).toBe(401);
  });

  it('401 — Bearer with no token value', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
  });
});
