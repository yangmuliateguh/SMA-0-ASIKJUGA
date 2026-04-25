import { Router } from 'express';
import {
  getAllSubjectsController,
  getSubjectByIdController,
  createSubjectController,
  updateSubjectController,
  deleteSubjectController,
} from '../controllers/subjectController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateBody, validateQuery } from '../middlewares/validator';
import { subjectSchema, subjectQuerySchema } from '../validations/authValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  validateQuery(subjectQuerySchema),
  getAllSubjectsController
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  getSubjectByIdController
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(subjectSchema),
  createSubjectController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(subjectSchema),
  updateSubjectController
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  deleteSubjectController
);

export default router;