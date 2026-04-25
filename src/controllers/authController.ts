import { Request, Response, NextFunction } from 'express';
import { loginService, registerUserService } from '../services/authService';
import { LoginInput, RegisterUserInput } from '../validations/authValidation';
import prisma from '../config/db';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;
    const result = await loginService(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = req.body as RegisterUserInput;
    const result = await registerUserService(input);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user; // authMiddleware sets user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Clear tokenExpiresAt to invalidate session
    await prisma.user.update({
      where: { id: user.userId },
      data: { tokenExpiresAt: null },
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};