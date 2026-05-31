import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';

// Import routes
import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import reportRoutes from './routes/reports.js';
import healthRoutes from './routes/health.js';
import paymentRoutes from './routes/payments.js';
import subscriptionRoutes from './routes/subscriptions.js';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  console.log('🛡️ Configuring CORS with origins:', config.frontendUrl);
  app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow any localhost origin
      if (origin.startsWith('http://localhost:')) return callback(null, true);

      // Allow any configured origins (exact match against array)
      if (config.frontendUrl.includes(origin)) return callback(null, true);

      // Allow www/non-www variants of configured origins
      const wwwStripped = origin.replace(/^https?:\/\/www\./, 'https://');
      if (config.frontendUrl.includes(wwwStripped)) return callback(null, true);

      // Reject otherwise
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check (no auth required)
  app.use('/api/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/scans', scanRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);

    // Don't expose internal errors in production
    const message = config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message;

    res.status(500).json({ error: message });
  });

  return app;
}
