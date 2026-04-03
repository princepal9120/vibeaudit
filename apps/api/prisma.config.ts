import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Load .env from the api directory
const envPath = path.join(import.meta.dirname, '.env');
dotenv.config({ path: envPath });

// Fallback to monorepo root
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(import.meta.dirname, '..', '..', '.env') });
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
