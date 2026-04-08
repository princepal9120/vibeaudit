import { createApp } from './app.js';
import { config, validateConfig } from './config.js';
import { prisma } from './db.js';
import { initializeQueue } from './workers/queue.js';

async function main() {
  // 1. Start HTTP server FIRST so healthchecks pass immediately
  const app = createApp();

  await new Promise<void>((resolve) => {
    app.listen(config.port, () => {
      console.log(`
🚀 VibeAudit API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Environment: ${config.nodeEnv}
   Port:        ${config.port}
   Frontend:    ${config.frontendUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
      resolve();
    });
  });

  // 2. Validate config (server is already up, healthcheck will pass)
  try {
    validateConfig();
    console.log('✅ Config validated');
  } catch (error) {
    console.error('❌ Config validation failed:', error instanceof Error ? error.message : error);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }

  // 3. Connect to database
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
    // Don't exit — healthcheck stays up, DB-dependent routes will fail gracefully
  }

  // 4. Initialize job queue
  try {
    await initializeQueue();
    console.log('✅ Job queue initialized');
  } catch (error) {
    console.error('⚠️ Job queue initialization failed (Redis may not be running):', error instanceof Error ? error.message : error);
    // Don't exit — scans won't work but the API stays up
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
