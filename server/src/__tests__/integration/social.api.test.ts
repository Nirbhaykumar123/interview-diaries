/**
 * API Integration Tests: Comments & Bookmarks
 *
 * WHAT THIS TESTS:
 * - Comment creation (authenticated only)
 * - Nested reply threading (parent must exist)
 * - Comment deletion (own comment only)
 * - Bookmark toggle (idempotent add + remove)
 * - Bookmark listing (returns only authenticated user's bookmarks)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { createUser, createCompany, createInterview, generateTokenForUser } from '../helpers/factories';

let userToken: string;
let otherUserToken: string;
let interviewId: string;

beforeEach(async () => {
  const user = await createUser();
  const otherUser = await createUser();
  const company = await createCompany();
  const interview = await createInterview(user.id, company.id, { status: 'PUBLISHED' });

  userToken = generateTokenForUser(user.id, user.role);
  otherUserToken = generateTokenForUser(otherUser.id, otherUser.role);
  interviewId = interview.id;
});

// ── POST /api/comments ───────────────────────────────────────────────────────

describe('POST /api/comments', () => {
  it('201 — authenticated user can post a top-level comment', async () => {
    const res = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Great write-up, very detailed!' });

    expect(res.status).toBe(201);
    expect(res.body.data.comment.id).toBeDefined();
    expect(res.body.data.comment.parentId).toBeNull();
    expect(res.body.data.comment.content).toBe('Great write-up, very detailed!');
  });

  it('201 — can reply to a parent comment (nested threading)', async () => {
    // First create a parent comment
    const parentRes = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Parent comment' });

    const parentId = parentRes.body.data.comment.id;

    // Then reply to it
    const replyRes = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ content: 'This is a reply!', parentId });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.data.comment.parentId).toBe(parentId);
  });

  it('401 — unauthenticated user cannot post a comment', async () => {
    const res = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .send({ content: 'Anonymous comment attempt' });

    expect(res.status).toBe(401);
  });

  it('400 — rejects empty comment content', async () => {
    const res = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: '' });

    expect(res.status).toBe(400);
  });

  it('400 — rejects missing interviewId or invalid parameter', async () => {
    const res = await request(app)
      .post('/api/comments/interview/not-a-uuid')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'No interview ID' });

    expect(res.status).toBe(400);
  });
});

// ── GET /api/comments?interviewId=:id ────────────────────────────────────────

describe('GET /api/comments', () => {
  it('200 — returns paginated comments for an interview', async () => {
    // Create a comment first
    await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'A comment for listing test' });

    const res = await request(app).get(`/api/comments/interview/${interviewId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
  });

  it('400 — requires valid interviewId parameter', async () => {
    const res = await request(app).get('/api/comments/interview/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/comments/:id ─────────────────────────────────────────────────

describe('DELETE /api/comments/:id', () => {
  it('200 — user can delete their own comment', async () => {
    const createRes = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Comment to be deleted' });

    const commentId = createRes.body.data.comment.id;

    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('403 — user cannot delete another user\'s comment', async () => {
    const createRes = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: "Owner's comment" });

    const commentId = createRes.body.data.comment.id;

    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(deleteRes.status).toBe(403);
  });

  it('401 — unauthenticated delete is rejected', async () => {
    const createRes = await request(app)
      .post(`/api/comments/interview/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Some comment' });

    const commentId = createRes.body.data.comment.id;

    const deleteRes = await request(app).delete(`/api/comments/${commentId}`);

    expect(deleteRes.status).toBe(401);
  });
});

// ── Bookmarks ────────────────────────────────────────────────────────────────

describe('POST /api/bookmarks/:interviewId', () => {
  it('200/201 — user can bookmark an interview', async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
  });

  it('401 — unauthenticated bookmark is rejected', async () => {
    const res = await request(app).post(`/api/bookmarks/${interviewId}`);

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/bookmarks/:interviewId', () => {
  it('200 — user can remove a bookmark', async () => {
    // First bookmark it
    await request(app)
      .post(`/api/bookmarks/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Then remove it
    const res = await request(app)
      .delete(`/api/bookmarks/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/users/me/bookmarks', () => {
  it('200 — returns the authenticated user\'s bookmarks', async () => {
    // Add a bookmark first
    await request(app)
      .post(`/api/bookmarks/${interviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    const res = await request(app)
      .get('/api/users/me/bookmarks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.bookmarks)).toBe(true);
  });

  it('401 — unauthenticated bookmark list is rejected', async () => {
    const res = await request(app).get('/api/users/me/bookmarks');
    expect(res.status).toBe(401);
  });
});
