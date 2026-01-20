import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from './config.js';

// Create connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter and logging in development
export const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});
