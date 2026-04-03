import type { Router as IRouter, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import { config } from '../config.js';
import express from 'express';
import cors from 'cors';

const router: IRouter = express.Router();

// Better Auth's toNodeHandler bypasses Express middleware headers,
// so we need CORS applied directly on this router
const authCors = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, origin);
    if (config.frontendUrl.includes(origin)) return callback(null, origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
});

// Apply CORS to all auth routes (including preflight)
router.use(authCors);

// Better-auth handles all auth routes
router.all('/*splat', (req: Request, res: Response) => {
  return toNodeHandler(auth)(req, res);
});

export default router;
