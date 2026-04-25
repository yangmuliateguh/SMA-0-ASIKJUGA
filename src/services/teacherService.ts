import prisma from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export interface PaginationParams {
  page: number;
  limit: number;
  name?: string;
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

export const getAllTeachersService = async (
  params: PaginationParams
): Promise<PaginatedResult<any>> => {
  const { page, limit, name } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  const [teachers, totalItems] = await prisma.$transaction([
    prisma.teacher.findMany({
      where,
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.teacher.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: teachers.map((t) => ({
      id: t.id,
      name: t.name,
      nip: t.nip,
      email: t.user.email,
    })),
    meta: { currentPage: page, limit, totalItems, totalPages },
  };
};

export const getTeacherByIdService = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: { select: { email: true } },
      grades: {
        include: {
          student: { select: { name: true, nisn: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  return teacher;
};

export const deleteTeacherService = async (teacherId: string) => {
  // Check if teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  // Check if teacher has any grades
  const gradesCount = await prisma.grade.count({
    where: { teacherId },
  });

  if (gradesCount > 0) {
    throw new AppError('Cannot delete teacher with existing grades', 400);
  }

  // Delete teacher
  await prisma.teacher.delete({
    where: { id: teacherId },
  });

  return { message: 'Teacher deleted successfully' };
};

export const updateTeacherService = async (teacherId: string, data: { name?: string; nip?: string }) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  // If nip is provided and different, check uniqueness
  if (data.nip && data.nip !== teacher.nip) {
    const existing = await prisma.teacher.findUnique({
      where: { nip: data.nip },
    });
    if (existing) {
      throw new AppError('NIP already exists', 400);
    }
  }

  const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data,
  });

  return updated;
};