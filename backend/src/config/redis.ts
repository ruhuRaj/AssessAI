import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    await redisClient.connect();
    console.log('✓ Redis connected successfully');
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    process.exit(1);
  }
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log('✓ Redis disconnected');
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};