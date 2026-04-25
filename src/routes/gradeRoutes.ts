import { Router } from 'express';
import { createGradeController, getMyGradesController, getAllGradesController } from '../controllers/gradeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateBody, validateQuery } from '../middlewares/validator';
import { createGradeSchema, gradeQuerySchema } from '../validations/authValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'TEACHER']),
  validateQuery(gradeQuerySchema),
  getAllGradesController
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['TEACHER']),
  validateBody(createGradeSchema),
  createGradeController
);

router.get(
  '/my-grades',
  authMiddleware,
  roleMiddleware(['STUDENT']),
  validateQuery(gradeQuerySchema),
  getMyGradesController
);

export default router;