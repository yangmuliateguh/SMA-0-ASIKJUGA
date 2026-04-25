import { Router } from 'express';
import { getAllStudentsController, getStudentByIdController, deleteStudentController, updateStudentController } from '../controllers/studentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateQuery, validateBody } from '../middlewares/validator';
import { studentQuerySchema, updateStudentSchema } from '../validations/authValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  validateQuery(studentQuerySchema),
  getAllStudentsController
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  getStudentByIdController
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  deleteStudentController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateBody(updateStudentSchema),
  updateStudentController
);

export default router;