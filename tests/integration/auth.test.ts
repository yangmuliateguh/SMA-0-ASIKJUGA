import request from 'supertest';
import app from '../../src/app';
import { createAdminToken, createTeacherToken, createStudentToken, createInvalidToken } from '../helpers/app';

const BASE_URL = '/api/v1/auth';

describe('Auth API Integration Tests', () => {
  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'admin@school.id',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        email: 'admin@school.id',
        role: 'ADMIN',
      });
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'nonexistent@school.id',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'admin@school.id',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'not-an-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for password less than 6 characters', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'admin@school.id',
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/register (Protected Route)', () => {
    it('should register a new STUDENT with valid data (ADMIN only)', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newstudent@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'New Student',
          nisn: '9999999999',
          classId: 'class-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
    });

    it('should register a new TEACHER with valid data (ADMIN only)', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newteacher@school.id',
          password: 'password123',
          role: 'TEACHER',
          name: 'New Teacher',
          nip: '123456790',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          email: 'test@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'Test Student',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${createInvalidToken()}`)
        .send({
          email: 'test@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'Test Student',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when non-admin tries to register', async () => {
      const teacherToken = createTeacherToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          email: 'test@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'Test Student',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. ADMIN role required.');
    });

    it('should return 400 for duplicate email', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin@school.id',
          password: 'password123',
          role: 'ADMIN',
          name: 'Admin Duplicate',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should return 400 when missing required fields for STUDENT', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'incompletestudent@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'Incomplete Student',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when missing required fields for TEACHER', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'incompleteteacher@school.id',
          password: 'password123',
          role: 'TEACHER',
          name: 'Incomplete Teacher',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});