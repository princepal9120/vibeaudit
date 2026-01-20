import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

// Create Prisma client with logging in development
export const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
