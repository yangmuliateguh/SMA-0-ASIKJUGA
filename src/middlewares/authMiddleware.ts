import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth';
import prisma from '../config/db';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Authorization header is required',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Use: Bearer <token>',
    });
    return;
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
    return;
  }

  // Verify user exists and token is still valid (session active)
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  const now = new Date();
  if (!user.tokenExpiresAt || user.tokenExpiresAt < now) {
    res.status(401).json({
      success: false,
      message: 'Token expired or invalid session',
    });
    return;
  }

  (req as AuthRequest).user = decoded;
  next();
};