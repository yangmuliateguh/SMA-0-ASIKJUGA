import prisma from '../config/db';
import { hashPassword, comparePassword, generateToken, JwtPayload, JWT_EXPIRES_IN } from '../utils/auth';
import { AppError } from '../middlewares/errorHandler';
import { Role } from '@prisma/client';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

function parseExpiresToMs(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);
  const units: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };
  return (units[unit] || 0) * value;
}

export const loginService = async (email: string, password: string): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check for active session (single login enforcement)
  const now = new Date();
  if (user.tokenExpiresAt && user.tokenExpiresAt > now) {
    throw new AppError('Already logged in from another device. Please log out first.', 403);
  }

  // Compute expiration date
  const expiryMs = parseExpiresToMs(JWT_EXPIRES_IN);
  const tokenExpiresAt = new Date(now.getTime() + expiryMs);

  // Update user with new token expiration
  await prisma.user.update({
    where: { id: user.id },
    data: { tokenExpiresAt },
  });

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export interface RegisterUserInput {
  email: string;
  password: string;
  role: Role;
  name: string;
  nisn?: string;
  nip?: string;
  classId?: string;
}

export const registerUserService = async (data: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  const hashedPassword = await hashPassword(data.password);

  if (data.role === 'STUDENT') {
    if (!data.nisn || !data.classId) {
      throw new AppError('NISN and classId are required for STUDENT role', 400);
    }

    const existingNisn = await prisma.student.findUnique({
      where: { nisn: data.nisn },
    });

    if (existingNisn) {
      throw new AppError('NISN already exists', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          name: data.name,
          nisn: data.nisn!,
          classId: data.classId!,
        },
      });

      return { user, student };
    });

    return result;
  }

  if (data.role === 'TEACHER') {
    if (!data.nip) {
      throw new AppError('NIP is required for TEACHER role', 400);
    }

    const existingNip = await prisma.teacher.findUnique({
      where: { nip: data.nip },
    });

    if (existingNip) {
      throw new AppError('NIP already exists', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: data.name,
          nip: data.nip!,
        },
      });

      return { user, teacher };
    });

    return result;
  }

  if (data.role === 'ADMIN') {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });
      return { user };
    });
    return result;
  }

  throw new AppError('Invalid role', 400);
};