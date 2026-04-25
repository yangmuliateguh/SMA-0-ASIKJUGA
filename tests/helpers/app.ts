import request from 'supertest';
import app from '../../src/app';
import { generateToken } from '../../src/utils/auth';

export const createAdminToken = () => {
  return generateToken({
    userId: 'user-admin-1',
    role: 'ADMIN',
    email: 'admin@school.id',
  });
};

export const createTeacherToken = () => {
  return generateToken({
    userId: 'user-teacher-1',
    role: 'TEACHER',
    email: 'ahmad@school.id',
  });
};

export const createStudentToken = () => {
  return generateToken({
    userId: 'user-student-1',
    role: 'STUDENT',
    email: 'budi@school.id',
  });
};

export const createInvalidToken = () => {
  return 'invalid-token-12345';
};

export const createExpiredToken = () => {
  return generateToken({
    userId: 'user-admin-1',
    role: 'ADMIN',
    email: 'admin@school.id',
  });
};

export default request(app);

export { request, app };