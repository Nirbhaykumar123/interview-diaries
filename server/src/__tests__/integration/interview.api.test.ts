/**
 * API Integration Tests: Interview CRUD + Permissions
 *
 * WHAT THIS TESTS:
 * The interview endpoints have the most complex authorization model:
 *   - Anyone can read PUBLISHED interviews
 *   - Only the author can read DRAFT interviews
 *   - Only the author (or ADMIN) can update or delete
 *   - Creating requires authentication
 *
 * We create real users and companies in the test DB via factories,
 * then generate Bearer tokens for them and make real HTTP requests.
 *
 * This validates that middleware, RBAC guards, and service logic all compose correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { createUser, createCompany, createInterview, generateTokenForUser } from '../helpers/factories';

// ── Shared test context ──────────────────────────────────────────────────────

let authorToken: string;
let otherUserToken: string;
let adminToken: string;
let companyId: string;
let publishedInterviewId: string;
let draftInterviewId: string;

// Standard interview payload for create/update operations
const validInterviewPayload = (compId: string) => ({
  companyId: compId,
  role: 'Software Engineer',
  type: 'PLACEMENT',
  degree: 'BTECH',
  branch: 'CSE',
  cgpa: 8.5,
  academicYear: '2025-2026',
  placementBatch: 2026,
  outcome: 'SELECTED',
  difficulty: 'MEDIUM',
  overallExperience: 'The interview was well-structured with clear expectations and friendly interviewers.',
  status: 'DRAFT',
  rounds: [
    {
      roundNumber: 1,
      roundType: 'TECHNICAL',
      description: 'Data structures problem solving session.',
      questionsAsked: ['Reverse a linked list', 'Find the longest common subsequence'],
    },
  ],
});

// Recreate test fixtures before EACH test (afterEach cleanup wipes the DB)
beforeEach(async () => {
  const author = await createUser();
  const otherUser = await createUser();
  const admin = await createUser({ role: 'ADMIN' });

  authorToken = generateTokenForUser(author.id, author.role);
  otherUserToken = generateTokenForUser(otherUser.id, otherUser.role);
  adminToken = generateTokenForUser(admin.id, admin.role);

  const company = await createCompany();
  companyId = company.id;

  const published = await createInterview(author.id, companyId, { status: 'PUBLISHED' });
  const draft = await createInterview(author.id, companyId, { status: 'DRAFT' });
  publishedInterviewId = published.id;
  draftInterviewId = draft.id;
});

// ── POST /api/interviews ─────────────────────────────────────────────────────

describe('POST /api/interviews', () => {
  it('201 — authenticated user can create an interview', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${authorToken}`)
      .send(validInterviewPayload(companyId));

    expect(res.status).toBe(201);
    expect(res.body.data.interview.id).toBeDefined();
    expect(res.body.data.interview.rounds).toHaveLength(1);
  });

  it('401 — unauthenticated user cannot create an interview', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .send(validInterviewPayload(companyId));

    expect(res.status).toBe(401);
  });

  it('400 — rejects duplicate round numbers', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        ...validInterviewPayload(companyId),
        rounds: [
          { roundNumber: 1, roundType: 'TECHNICAL', description: 'Round number one', questionsAsked: ['Q1'] },
          { roundNumber: 1, roundType: 'HR', description: 'Duplicate number', questionsAsked: ['Q2'] },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unique/i);
  });

  it('404 — rejects invalid companyId', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${authorToken}`)
      .send(validInterviewPayload('00000000-0000-0000-0000-000000000000'));

    expect(res.status).toBe(404);
  });
});

// ── GET /api/interviews ──────────────────────────────────────────────────────

describe('GET /api/interviews', () => {
  it('200 — returns paginated list of PUBLISHED interviews', async () => {
    const res = await request(app).get('/api/interviews');

    expect(res.status).toBe(200);
    expect(res.body.data.interviews).toBeDefined();
    expect(Array.isArray(res.body.data.interviews)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);

    // Drafts should NOT appear in the public list
    const hasDraft = res.body.data.interviews.some((i: any) => i.status === 'DRAFT');
    expect(hasDraft).toBe(false);
  });

  it('200 — supports page and limit query params', async () => {
    const res = await request(app).get('/api/interviews?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(5);
  });
});

// ── GET /api/interviews/:id ──────────────────────────────────────────────────

describe('GET /api/interviews/:id', () => {
  it('200 — anyone can read a PUBLISHED interview', async () => {
    const res = await request(app).get(`/api/interviews/${publishedInterviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.interview.id).toBe(publishedInterviewId);
  });

  it('403 — unauthenticated user cannot read a DRAFT interview', async () => {
    const res = await request(app).get(`/api/interviews/${draftInterviewId}`);

    expect(res.status).toBe(403);
  });

  it('200 — the AUTHOR can read their own DRAFT', async () => {
    const res = await request(app)
      .get(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.interview.status).toBe('DRAFT');
  });

  it('403 — another user cannot read someone else\'s DRAFT', async () => {
    const res = await request(app)
      .get(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  it('200 — ADMIN can read any DRAFT interview', async () => {
    const res = await request(app)
      .get(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('404 — returns 404 for non-existent interview', async () => {
    const res = await request(app).get('/api/interviews/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/interviews/:id ────────────────────────────────────────────────

describe('PATCH /api/interviews/:id', () => {
  it('200 — author can update their own interview', async () => {
    const res = await request(app)
      .patch(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ role: 'Senior Software Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.data.interview.role).toBe('Senior Software Engineer');
  });

  it('403 — another user cannot update someone else\'s interview', async () => {
    const res = await request(app)
      .patch(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ role: 'Hacker Role' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/permission/i);
  });

  it('200 — admin can update any interview', async () => {
    const res = await request(app)
      .patch(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'Admin Updated Role' });

    expect(res.status).toBe(200);
  });

  it('401 — unauthenticated user cannot update', async () => {
    const res = await request(app)
      .patch(`/api/interviews/${draftInterviewId}`)
      .send({ role: 'Unauthorized' });

    expect(res.status).toBe(401);
  });
});

// ── DELETE /api/interviews/:id ───────────────────────────────────────────────

describe('DELETE /api/interviews/:id', () => {
  it('403 — other user cannot delete someone else\'s interview', async () => {
    const res = await request(app)
      .delete(`/api/interviews/${draftInterviewId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  it('401 — unauthenticated user cannot delete', async () => {
    const res = await request(app).delete(`/api/interviews/${draftInterviewId}`);
    expect(res.status).toBe(401);
  });

  it('200 — author can delete their own interview', async () => {
    // Create a fresh interview to delete
    const author = await createUser();
    const token = generateTokenForUser(author.id, author.role);
    const created = await createInterview(author.id, companyId);

    const res = await request(app)
      .delete(`/api/interviews/${created.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
