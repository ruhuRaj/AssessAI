"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("../config/redis");
class CacheService {
    constructor() {
        this.CACHE_TTL = 60 * 60 * 24; // 24 hours
    }
    async get(key) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            await redis.setEx(key, ttl || this.CACHE_TTL, JSON.stringify(value));
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async delete(key) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            await redis.del(key);
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    async invalidatePattern(pattern) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(keys);
            }
        }
        catch (error) {
            console.error('Cache invalidate error:', error);
        }
    }
    getCacheKey(type, id) {
        return `${type}:${id}`;
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=CacheService.js.map