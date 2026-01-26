import type { Router as IRouter, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import express from 'express';

const router: IRouter = express.Router();

// Debug logging for auth requests
router.use((req: Request, _res, next) => {
  console.log(`[AUTH] ${req.method} ${req.url}`);
  console.log(`[AUTH] Base URL: ${req.baseUrl}`);
  console.log(`[AUTH] Full path: ${req.path}`);
  next();
});

// Better-auth handles all auth routes
// Delegate all requests to better-auth handler
router.all('/*splat', (req: Request, res: Response) => {
  return toNodeHandler(auth)(req, res);
});

export default router;
