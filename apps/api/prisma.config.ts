import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Load .env from the api directory
dotenv.config({ path: path.join(import.meta.dirname, '.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaPg(pool);
    },
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
