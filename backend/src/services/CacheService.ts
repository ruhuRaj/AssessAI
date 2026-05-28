import { getRedisClient } from '../config/redis';

export class CacheService {
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours

  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setEx(
        key,
        ttl || this.CACHE_TTL,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  getCacheKey(type: string, id: string): string {
    return `${type}:${id}`;
  }
}

export const cacheService = new CacheService();
