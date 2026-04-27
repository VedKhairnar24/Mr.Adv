const Redis = require('ioredis');
const logger = require('./logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    if (times > 10) {
      logger.error('Redis: Max retry attempts reached');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Exponential backoff
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Event listeners
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error.message);
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
  logger.info('Redis connection closed gracefully');
});

module.exports = redis;
