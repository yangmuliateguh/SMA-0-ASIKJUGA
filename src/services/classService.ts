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

export const getAllClassesService = async (
  params: PaginationParams
): Promise<PaginatedResult<any>> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [classes, totalItems] = await prisma.$transaction([
    prisma.class.findMany({
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { gradeLevel: 'asc' },
      skip,
      take: limit,
    }),
    prisma.class.count(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: classes.map((c) => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      studentCount: c._count.students,
    })),
    meta: { currentPage: page, limit, totalItems, totalPages },
  };
};

export const getClassByIdService = async (classId: string) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        where: { isDeleted: false },
        select: { id: true, name: true, nisn: true },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!classData) {
    throw new AppError('Class not found', 404);
  }

  return classData;
};

export const createClassService = async (name: string, gradeLevel: number) => {
  const existingClass = await prisma.class.findUnique({
    where: { name },
  });

  if (existingClass) {
    throw new AppError('Class name already exists', 400);
  }

  const newClass = await prisma.class.create({
    data: { name, gradeLevel },
  });

  return newClass;
};

export const updateClassService = async (classId: string, name: string, gradeLevel: number) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classData) {
    throw new AppError('Class not found', 404);
  }

  if (name !== classData.name) {
    const existing = await prisma.class.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('Class name already exists', 400);
    }
  }

  const updated = await prisma.class.update({
    where: { id: classId },
    data: { name, gradeLevel },
  });

  return updated;
};

export const deleteClassService = async (classId: string) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classData) {
    throw new AppError('Class not found', 404);
  }

  const studentCount = await prisma.student.count({
    where: { classId, isDeleted: false },
  });

  if (studentCount > 0) {
    throw new AppError('Cannot delete class with active students', 400);
  }

  await prisma.class.delete({ where: { id: classId } });

  return { message: 'Class deleted successfully' };
};