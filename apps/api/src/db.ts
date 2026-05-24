import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
export const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});
