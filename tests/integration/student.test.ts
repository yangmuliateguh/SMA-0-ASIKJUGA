import request from 'supertest';
import app from '../../src/app';
import { createAdminToken, createTeacherToken, createStudentToken, createInvalidToken } from '../helpers/app';

const BASE_URL = '/api/v1/students';

describe('Student API Integration Tests', () => {
  describe('GET /students (Protected Route)', () => {
    it('should return all students for ADMIN', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return all students for TEACHER', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get(BASE_URL);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${createInvalidToken()}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for STUDENT role', async () => {
      const studentToken = createStudentToken();

      const response = await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should filter students by classId', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get(BASE_URL)
        .query({ classId: 'class-1' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid classId format', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get(BASE_URL)
        .query({ classId: 'invalid-uuid' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /students/:id (Protected Route)', () => {
    it('should soft delete student successfully (ADMIN only)', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .delete(`${BASE_URL}/student-1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDeleted).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete(`${BASE_URL}/student-1`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for TEACHER role', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .delete(`${BASE_URL}/student-1`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for STUDENT role', async () => {
      const studentToken = createStudentToken();

      const response = await request(app)
        .delete(`${BASE_URL}/student-1`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent student', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .delete(`${BASE_URL}/nonexistent-student`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 400 when student already deleted', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .delete(`${BASE_URL}/student-already-deleted`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});