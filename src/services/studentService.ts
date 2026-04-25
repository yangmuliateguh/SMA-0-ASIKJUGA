import prisma from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export interface PaginationParams {
  page: number;
  limit: number;
  name?: string;
  classId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getAllStudentsService = async (
  params: PaginationParams
): Promise<PaginatedResult<any>> => {
  const { page, limit, name, classId } = params;
  const skip = (page - 1) * limit;

  const where: any = { isDeleted: false };
  if (classId) {
    where.classId = classId;
  }
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  const [students, totalItems] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: {
        class: true,
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: students,
    meta: {
      currentPage: page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const deleteStudentService = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.isDeleted) {
    throw new AppError('Student already deleted', 400);
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { isDeleted: true },
  });

  return updated;
};

export const getStudentByIdService = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      user: { select: { email: true } },
      grades: {
        include: {
          subject: { select: { name: true } },
          teacher: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.isDeleted) {
    throw new AppError('Student has been deleted', 404);
  }

  return student;
};

export const updateStudentService = async (studentId: string, data: { name?: string; nisn?: string; classId?: string }) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.isDeleted) {
    throw new AppError('Cannot update deleted student', 400);
  }

  // If nisn is provided and different, check uniqueness
  if (data.nisn && data.nisn !== student.nisn) {
    const existing = await prisma.student.findUnique({
      where: { nisn: data.nisn },
    });
    if (existing) {
      throw new AppError('NISN already exists', 400);
    }
  }

  // If classId is provided, verify class exists
  if (data.classId) {
    const cls = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!cls) {
      throw new AppError('Class not found', 404);
    }
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data,
  });

  return updated;
};