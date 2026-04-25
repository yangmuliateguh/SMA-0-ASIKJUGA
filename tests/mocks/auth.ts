import { hashPassword, comparePassword, generateToken, verifyToken, JwtPayload } from '../../src/utils/auth';

export const mockHashPassword = async (password: string): Promise<string> => {
  return '$2b$10$mockhashedpassword12345678901234567890';
};

export const mockComparePassword = async (_password: string, _hash: string): Promise<boolean> => {
  return true;
};

export const mockGenerateToken = (payload: JwtPayload): string => {
  return `mock-token-${payload.userId}`;
};

export const mockVerifyToken = (_token: string): JwtPayload | null => {
  return {
    userId: 'mock-user-id',
    role: 'ADMIN',
    email: 'test@test.com',
  };
};