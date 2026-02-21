
export const config = {
  port: Number(process.env.PORT || 3000),
  apiKey: process.env.API_KEY || "forge-default-key",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  vendor: process.env.VENDOR || "vast",
  vendorApiKey: process.env.VENDOR_API_KEY || "",
  idleTimeoutMinutes: Number(process.env.IDLE_TIMEOUT || 15),
  modelHealthUrl: process.env.MODEL_HEALTH_URL || "/health",
  startupTimeoutSeconds: Number(process.env.STARTUP_TIMEOUT || 600),
  healthCheckIntervalMs: Number(process.env.HEALTH_CHECK_INTERVAL || 5000),
};
