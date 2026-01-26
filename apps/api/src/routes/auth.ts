import type { Router as IRouter } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import express from 'express';

const router: IRouter = express.Router();

// Better-auth handles all auth routes
// This includes: /sign-up, /sign-in, /sign-out, /get-session, /oauth/*
router.all('/:path*', async (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// Handle root path as well
router.all('/', async (req, res) => {
  return toNodeHandler(auth)(req, res);
});

export default router;
