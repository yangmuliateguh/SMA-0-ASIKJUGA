import { Request, Response, NextFunction } from 'express';
import { getAllTeachersService, getTeacherByIdService, deleteTeacherService, updateTeacherService } from '../services/teacherService';
import { PaginationParams } from '../services/teacherService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorHandler';

export const getAllTeachersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req as any).validatedQuery || {};
    const { page = 1, limit = 10 } = query;

    const result = await getAllTeachersService({ page, limit, name: query.name });

    res.status(200).json({
      success: true,
      message: 'Teachers retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await getTeacherByIdService(id);

    res.status(200).json({
      success: true,
      message: 'Teacher retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacherController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await deleteTeacherService(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacherController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = req.body as { name?: string; nip?: string };
    const result = await updateTeacherService(id, data);

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};