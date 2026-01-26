import { createApp } from './app.js';
import { config, validateConfig } from './config.js';
import { prisma } from './db.js';
import { initializeQueue } from './workers/queue.js';

async function main() {
  // Validate config
  validateConfig();

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Initialize job queue
  try {
    await initializeQueue();
    console.log('✅ Job queue initialized');
  } catch (error) {
    console.error('⚠️ Job queue initialization failed (Redis may not be running):', error);
    // Continue without queue in development
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }

  // Create and start server
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`
🚀 ShipSafe API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Environment: ${config.nodeEnv}
   Port:        ${config.port}
   Frontend:    ${config.frontendUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
