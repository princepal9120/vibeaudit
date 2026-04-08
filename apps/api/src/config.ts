import 'dotenv/config';

export const config = {
  // Server
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/vibeaudit',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Better Auth
  jwtSecret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:8000',

  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8000/api/auth/github/callback',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/api/auth/google/callback',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // ImageKit (for PDF/file storage)
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',

  // Dodo Payments
  dodoPaymentsApiKey: process.env.DODO_PAYMENTS_API_KEY || '',
  dodoPaymentsWebhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '',
  dodoPaymentsEnvironment: (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode') as 'test_mode' | 'live_mode',

  // Frontend URLs (for CORS) — supports comma-separated list
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(u => u.trim()),

  // Scan settings
  maxScanTimeMs: 180000, // 3 minutes
  tempDir: process.env.TEMP_DIR || '/tmp/vibeaudit-scans',
} as const;

// Validate required config
export function validateConfig() {
  // JWT_SECRET/BETTER_AUTH_SECRET is always required (security-critical)
  if (!config.jwtSecret) {
    throw new Error(
      'BETTER_AUTH_SECRET environment variable is required. ' +
      'Generate a secure random secret (e.g., openssl rand -base64 32)'
    );
  }

  // Check required vars in production (warn instead of crash for non-critical)
  if (config.nodeEnv === 'production') {
    const critical = ['DATABASE_URL'];
    const recommended = [
      'REDIS_URL',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
    ];

    const missingCritical = critical.filter(key => !process.env[key]);
    if (missingCritical.length > 0) {
      throw new Error(`Missing critical environment variables: ${missingCritical.join(', ')}`);
    }

    const missingRecommended = recommended.filter(key => !process.env[key]);
    if (missingRecommended.length > 0) {
      console.warn(`⚠️ Missing recommended environment variables: ${missingRecommended.join(', ')}`);
      console.warn('Some features (OAuth, scanning, AI) will be unavailable.');
    }
  }
}
