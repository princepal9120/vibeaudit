export const config = {
  // API URL for the VibeAudit backend
  apiUrl: process.env.VIBEAUDIT_API_URL || 'http://localhost:3001',

  // API key for authentication (optional - uses session if not provided)
  apiKey: process.env.VIBEAUDIT_API_KEY,

  // Request timeout in milliseconds
  requestTimeout: parseInt(process.env.VIBEAUDIT_REQUEST_TIMEOUT || '30000', 10),

  // Polling interval for scan status (milliseconds)
  pollInterval: parseInt(process.env.VIBEAUDIT_POLL_INTERVAL || '2000', 10),

  // Maximum time to wait for scan completion (milliseconds)
  maxWaitTime: parseInt(process.env.VIBEAUDIT_MAX_WAIT_TIME || '180000', 10),
} as const;
