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

export const getAllSubjectsService = async (
  params: PaginationParams
): Promise<PaginatedResult<any>> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [subjects, totalItems] = await prisma.$transaction([
    prisma.subject.findMany({
      include: {
        _count: { select: { grades: true } },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.subject.count(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      gradeCount: s._count.grades,
    })),
    meta: { currentPage: page, limit, totalItems, totalPages },
  };
};

export const getSubjectByIdService = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      grades: {
        include: {
          student: { select: { name: true, nisn: true } },
          teacher: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  return subject;
};

export const createSubjectService = async (name: string) => {
  const existing = await prisma.subject.findUnique({ where: { name } });
  if (existing) {
    throw new AppError('Subject name already exists', 400);
  }

  const subject = await prisma.subject.create({ data: { name } });
  return subject;
};

export const updateSubjectService = async (subjectId: string, name: string) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  if (name !== subject.name) {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('Subject name already exists', 400);
    }
  }

  const updated = await prisma.subject.update({
    where: { id: subjectId },
    data: { name },
  });

  return updated;
};

export const deleteSubjectService = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  const gradeCount = await prisma.grade.count({ where: { subjectId } });
  if (gradeCount > 0) {
    throw new AppError('Cannot delete subject with existing grades', 400);
  }

  await prisma.subject.delete({ where: { id: subjectId } });
  return { message: 'Subject deleted successfully' };
};