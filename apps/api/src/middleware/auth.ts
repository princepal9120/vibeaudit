import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthRequest extends Request {
  userId?: number;
}

interface JWTPayload {
  userId: number;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.userId = payload.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

// Optional authentication - allows unauthenticated requests but adds userId if token present
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
      req.userId = payload.userId;
    } catch {
      // Token invalid, but that's okay for optional auth
    }
  }

  next();
}
