import { Router } from 'express';
import {
  getAllClassesController,
  getClassByIdController,
  createClassController,
  updateClassController,
  deleteClassController,
} from '../controllers/classController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateBody, validateQuery } from '../middlewares/validator';
import { classSchema, classQuerySchema } from '../validations/authValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  validateQuery(classQuerySchema),
  getAllClassesController
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  getClassByIdController
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(classSchema),
  createClassController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(classSchema),
  updateClassController
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  deleteClassController
);

export default router;