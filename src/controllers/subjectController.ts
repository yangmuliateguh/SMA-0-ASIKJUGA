import { Request, Response, NextFunction } from 'express';
import {
  getAllSubjectsService,
  getSubjectByIdService,
  createSubjectService,
  updateSubjectService,
  deleteSubjectService,
} from '../services/subjectService';

export const getAllSubjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req as any).validatedQuery || {};
    const { page = 1, limit = 10 } = query;

    const result = await getAllSubjectsService({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await getSubjectByIdService(id);

    res.status(200).json({
      success: true,
      message: 'Subject retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const result = await createSubjectService(name);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name } = req.body;
    const result = await updateSubjectService(id, name);

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await deleteSubjectService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};