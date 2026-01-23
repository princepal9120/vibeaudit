import { Router, type Request, type Response, type IRouter } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';

const router: IRouter = Router();

// Better-auth handles all auth routes
// This includes: /signup, /signin, /signout, /session, /oauth/*
router.all('/*', (req: Request, res: Response) => {
  // Convert Express request to better-auth node handler
  return toNodeHandler(auth)(req, res);
});

export default router;
