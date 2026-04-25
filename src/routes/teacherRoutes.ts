import { Router } from 'express';
import { getAllTeachersController, getTeacherByIdController, deleteTeacherController, updateTeacherController } from '../controllers/teacherController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateQuery, validateBody } from '../middlewares/validator';
import { teacherQuerySchema, updateTeacherSchema } from '../validations/authValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateQuery(teacherQuerySchema),
  getAllTeachersController
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  getTeacherByIdController
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  deleteTeacherController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(updateTeacherSchema),
  updateTeacherController
);

export default router;