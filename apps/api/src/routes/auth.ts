import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to generate JWT
function generateToken(userId: number): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// POST /api/auth/signup - Register new user
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = signupSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    next(error);
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    next(error);
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (_req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint exists for API consistency
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        githubId: true,
        createdAt: true,
        _count: {
          select: { scans: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      ...user,
      scanCount: user._count.scans,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/github - Initiate GitHub OAuth
router.get('/github', (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user user:email',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GET /api/auth/github/callback - GitHub OAuth callback
router.get('/github/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      res.status(400).json({ error: 'Failed to get access token' });
      return;
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const githubUser = await userResponse.json() as {
      id: number;
      login: string;
      email: string | null;
      avatar_url: string;
      name: string | null;
    };

    // Get user's primary email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });
      const emails = await emailResponse.json() as Array<{ email: string; primary: boolean }>;
      const primaryEmail = emails.find(e => e.primary);
      email = primaryEmail?.email || null;
    }

    if (!email) {
      res.status(400).json({ error: 'Could not get email from GitHub' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: String(githubUser.id) },
          { email },
        ],
      },
    });

    if (user) {
      // Update existing user with GitHub info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: String(githubUser.id),
          avatar: githubUser.avatar_url,
          name: user.name || githubUser.name || githubUser.login,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          githubId: String(githubUser.id),
          name: githubUser.name || githubUser.login,
          avatar: githubUser.avatar_url,
        },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
});

export default router;
