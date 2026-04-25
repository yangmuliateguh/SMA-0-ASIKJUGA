import prisma from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export interface CreateGradeInput {
  studentId: string;
  subjectId: string;
  score: number;
  semester: number;
  academicYear: string;
  teacherId: string;
}

export interface GradeQueryParams {
  page: number;
  limit: number;
  semester?: number;
  academicYear?: string;
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

export const createGradeService = async (data: CreateGradeInput) => {
  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.isDeleted) {
    throw new AppError('Cannot add grade to deleted student', 400);
  }

  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
  });

  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  const grade = await prisma.grade.create({
    data: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      score: data.score,
      semester: data.semester,
      academicYear: data.academicYear,
    },
  });

  return grade;
};

export interface GradeQueryParams {
  page: number;
  limit: number;
  semester?: number;
  academicYear?: string;
}

export const getMyGradesService = async (
  userId: string,
  params: GradeQueryParams
): Promise<PaginatedResult<any>> => {
  const { page, limit, semester, academicYear } = params;
  const skip = (page - 1) * limit;

  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new AppError('Student profile not found', 404);
  }

  const where: any = { studentId: student.id };
  if (semester) {
    where.semester = semester;
  }
  if (academicYear) {
    where.academicYear = academicYear;
  }

  const [grades, totalItems] = await prisma.$transaction([
    prisma.grade.findMany({
      where,
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.grade.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: grades,
    meta: {
      currentPage: page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export interface GetAllGradesParams extends GradeQueryParams {
  studentId?: string;
  subjectId?: string;
  teacherId?: string;
}

export const getAllGradesService = async (
  params: GetAllGradesParams
): Promise<PaginatedResult<any>> => {
  const { page, limit, semester, academicYear, studentId, subjectId, teacherId } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (semester) where.semester = semester;
  if (academicYear) where.academicYear = academicYear;
  if (studentId) where.studentId = studentId;
  if (subjectId) where.subjectId = subjectId;
  if (teacherId) where.teacherId = teacherId;

  const [grades, totalItems] = await prisma.$transaction([
    prisma.grade.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nisn: true } },
        subject: { select: { name: true } },
        teacher: { select: { id: true, name: true, nip: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.grade.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: grades,
    meta: { currentPage: page, limit, totalItems, totalPages },
  };
};