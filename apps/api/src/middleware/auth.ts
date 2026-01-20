import { type Request, type Response, type NextFunction } from 'express';
import { auth, type Session, type User } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export interface AuthRequest extends Request {
  user?: User;
  session?: Session;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    req.user = session.user;
    req.session = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }
}

// Optional authentication - allows unauthenticated requests but adds user if session present
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = session.user;
      req.session = session;
    }
  } catch {
    // Session invalid, but that's okay for optional auth
  }

  next();
}

// Helper to get user ID from request
export function getUserId(req: AuthRequest): string {
  if (!req.user?.id) {
    throw new Error('User not authenticated');
  }
  return req.user.id;
}
