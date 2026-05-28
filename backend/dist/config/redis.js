"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = exports.disconnectRedis = exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisClient = null;
const connectRedis = async () => {
    try {
        exports.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        exports.redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await exports.redisClient.connect();
        console.log('✓ Redis connected successfully');
    }
    catch (error) {
        console.error('✗ Redis connection failed:', error);
        process.exit(1);
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (exports.redisClient) {
        await exports.redisClient.disconnect();
        console.log('✓ Redis disconnected');
    }
};
exports.disconnectRedis = disconnectRedis;
const getRedisClient = () => {
    if (!exports.redisClient) {
        throw new Error('Redis client not initialized');
    }
    return exports.redisClient;
};
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map