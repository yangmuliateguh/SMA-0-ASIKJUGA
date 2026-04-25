import request from 'supertest';
import app from '../../src/app';
import { createAdminToken, createTeacherToken, createStudentToken, createInvalidToken } from '../helpers/app';

const BASE_URL = '/api/v1/grades';

describe('Grade API Integration Tests', () => {
  describe('POST /grades (Protected Route - TEACHER only)', () => {
    it('should create grade successfully', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('score', 85);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(BASE_URL)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-TEACHER role', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when student not found', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'nonexistent-student',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 400 when score is below 0', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: -1,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when score is above 100', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 101,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid studentId format', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'invalid-uuid',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid academicYear format', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid semester', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 3,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when subject not found', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'student-1',
          subjectId: 'nonexistent-subject',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Subject not found');
    });

    it('should return 400 when student is deleted', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: 'deleted-student',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot add grade to deleted student');
    });
  });

  describe('GET /grades/my-grades (Protected Route - STUDENT only)', () => {
    it('should return grades for the authenticated student', async () => {
      const studentToken = createStudentToken();

      const response = await request(app)
        .get(`${BASE_URL}/my-grades`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get(`${BASE_URL}/my-grades`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for ADMIN role', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get(`${BASE_URL}/my-grades`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for TEACHER role', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .get(`${BASE_URL}/my-grades`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when student profile not found', async () => {
      const invalidToken = createInvalidToken();

      const response = await request(app)
        .get(`${BASE_URL}/my-grades`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});