import { Request, Response, NextFunction } from 'express';
import { getAllStudentsService, getStudentByIdService, deleteStudentService, updateStudentService } from '../services/studentService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { StudentQueryInput } from '../validations/authValidation';
import { AppError } from '../middlewares/errorHandler';

export const getAllStudentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as StudentQueryInput;
    const { page, limit, name, classId } = query;

    const result = await getAllStudentsService({ page, limit, name, classId });

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await deleteStudentService(id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await getStudentByIdService(id);

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = req.body as { name?: string; nisn?: string; classId?: string };
    const result = await updateStudentService(id, data);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};