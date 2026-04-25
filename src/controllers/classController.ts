import { Request, Response, NextFunction } from 'express';
import {
  getAllClassesService,
  getClassByIdService,
  createClassService,
  updateClassService,
  deleteClassService,
} from '../services/classService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req as any).validatedQuery || {};
    const { page = 1, limit = 10 } = query;

    const result = await getAllClassesService({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Classes retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await getClassByIdService(id);

    res.status(200).json({
      success: true,
      message: 'Class retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createClassController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, gradeLevel } = req.body;
    const result = await createClassService(name, gradeLevel);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClassController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, gradeLevel } = req.body;
    const result = await updateClassService(id, name, gradeLevel);

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClassController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await deleteClassService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};