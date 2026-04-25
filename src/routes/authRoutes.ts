import { Router } from 'express';
import { loginController, registerController, logoutController } from '../controllers/authController';
import { validateBody } from '../middlewares/validator';
import { loginSchema, registerUserSchema } from '../validations/authValidation';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), loginController);
router.post('/register', authLimiter, authMiddleware, roleMiddleware(['ADMIN']), validateBody(registerUserSchema), registerController);
router.post('/logout', authLimiter, authMiddleware, logoutController);

export default router;