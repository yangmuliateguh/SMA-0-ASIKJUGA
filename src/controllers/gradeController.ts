import { Request, Response, NextFunction } from 'express';
import { createGradeService, getMyGradesService, getAllGradesService } from '../services/gradeService';
import { CreateGradeInput } from '../services/gradeService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GradeQueryInput } from '../validations/authValidation';
import prisma from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export const createGradeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const gradeData = req.body as Omit<CreateGradeInput, 'teacherId'>;

    // Find teacher record associated with the logged-in user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user!.userId },
    });

    if (!teacher) {
      throw new AppError('Teacher profile not found for this user', 404);
    }

    const result = await createGradeService({
      ...gradeData,
      teacherId: teacher.id,
    });

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyGradesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const query = (req as any).validatedQuery as GradeQueryInput;
    const { page, limit, semester, academicYear } = query;

    const result = await getMyGradesService(user!.userId, {
      page,
      limit,
      semester,
      academicYear,
    });

    res.status(200).json({
      success: true,
      message: 'Grades retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGradesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req as any).validatedQuery || {};
    const { page = 1, limit = 10, semester, academicYear, studentId, subjectId } = query;

    const result = await getAllGradesService({
      page,
      limit,
      semester,
      academicYear,
      studentId,
      subjectId,
    });

    res.status(200).json({
      success: true,
      message: 'All grades retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};