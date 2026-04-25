import * as authService from '../../src/services/authService';
import * as authUtils from '../../src/utils/auth';
import prisma from '../../src/config/db';

describe('AuthService', () => {
  let findUniqueSpy: jest.SpyInstance;
  let createUserSpy: jest.SpyInstance;
  let createStudentSpy: jest.SpyInstance;
  let createTeacherSpy: jest.SpyInstance;
  let transactionSpy: jest.SpyInstance;
  let hashPasswordSpy: jest.SpyInstance;
  let comparePasswordSpy: jest.SpyInstance;
  let generateTokenSpy: jest.SpyInstance;

  const mockUsers = [
    {
      id: 'user-admin-1',
      email: 'admin@school.id',
      password: '$2b$10$hashedpassword',
      role: 'ADMIN' as const,
    },
    {
      id: 'user-teacher-1',
      email: 'ahmad@school.id',
      password: '$2b$10$hashedpassword',
      role: 'TEACHER' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');
    createUserSpy = jest.spyOn(prisma.user, 'create');
    createStudentSpy = jest.spyOn(prisma.student, 'create');
    createTeacherSpy = jest.spyOn(prisma.teacher, 'create');
    transactionSpy = jest.spyOn(prisma, '$transaction');
    hashPasswordSpy = jest.spyOn(authUtils, 'hashPassword');
    comparePasswordSpy = jest.spyOn(authUtils, 'comparePassword');
    generateTokenSpy = jest.spyOn(authUtils, 'generateToken');
  });

  describe('loginService', () => {
    it('should login successfully with valid credentials', async () => {
      findUniqueSpy.mockResolvedValueOnce(mockUsers[0]);
      comparePasswordSpy.mockResolvedValueOnce(true);
      generateTokenSpy.mockReturnValue('mock-jwt-token');

      const result = await authService.loginService('admin@school.id', 'password123');

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('admin@school.id');
      expect(result.user.role).toBe('ADMIN');
    });

    it('should throw error when user not found', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);

      await expect(
        authService.loginService('invalid@school.id', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when password is invalid', async () => {
      findUniqueSpy.mockResolvedValueOnce(mockUsers[0]);
      comparePasswordSpy.mockResolvedValueOnce(false);

      await expect(
        authService.loginService('admin@school.id', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('registerUserService', () => {
    it('should register STUDENT successfully', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);
      hashPasswordSpy.mockResolvedValue('$2b$10$hashed');
      
      transactionSpy.mockImplementation(async (callback: any) => {
        const tx = {
          user: { create: jest.fn().mockResolvedValue({ id: 'new-user-id' }) },
          student: { create: jest.fn().mockResolvedValue({ id: 'new-student-id' }) },
        };
        return callback(tx);
      });

      const result = await authService.registerUserService({
        email: 'newstudent@school.id',
        password: 'password123',
        role: 'STUDENT',
        name: 'New Student',
        nisn: '9999999999',
        classId: 'class-1',
      });

      expect(result.user).toBeDefined();
      expect(result.student).toBeDefined();
    });

    it('should register TEACHER successfully', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);
      hashPasswordSpy.mockResolvedValue('$2b$10$hashed');
      
      transactionSpy.mockImplementation(async (callback: any) => {
        const tx = {
          user: { create: jest.fn().mockResolvedValue({ id: 'new-user-id' }) },
          teacher: { create: jest.fn().mockResolvedValue({ id: 'new-teacher-id' }) },
        };
        return callback(tx);
      });

      const result = await authService.registerUserService({
        email: 'newteacher@school.id',
        password: 'password123',
        role: 'TEACHER',
        name: 'New Teacher',
        nip: '123456788',
      });

      expect(result.user).toBeDefined();
      expect(result.teacher).toBeDefined();
    });

    it('should throw error when email already exists', async () => {
      findUniqueSpy.mockResolvedValueOnce(mockUsers[0]);

      await expect(
        authService.registerUserService({
          email: 'admin@school.id',
          password: 'password123',
          role: 'ADMIN',
          name: 'Admin',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should throw error when NISN is missing for STUDENT', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);

      await expect(
        authService.registerUserService({
          email: 'student@school.id',
          password: 'password123',
          role: 'STUDENT',
          name: 'Student',
          nisn: undefined,
          classId: 'class-1',
        })
      ).rejects.toThrow('NISN and classId are required for STUDENT role');
    });

    it('should throw error when NIP is missing for TEACHER', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);

      await expect(
        authService.registerUserService({
          email: 'teacher@school.id',
          password: 'password123',
          role: 'TEACHER',
          name: 'Teacher',
          nip: undefined,
        })
      ).rejects.toThrow('NIP is required for TEACHER role');
    });
  });
});