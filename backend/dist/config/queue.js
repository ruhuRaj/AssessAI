"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeQueues = exports.pdfGenerationQueue = exports.questionGenerationQueue = void 0;
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConnection = {
    url: process.env.REDIS_URL,
};
exports.questionGenerationQueue = new bullmq_1.Queue('question-generation', {
    connection: redisConnection,
});
exports.pdfGenerationQueue = new bullmq_1.Queue('pdf-generation', {
    connection: redisConnection,
});
const initializeQueues = async () => {
    console.log('✓ BullMQ queues initialized');
};
exports.initializeQueues = initializeQueues;
//# sourceMappingURL=queue.js.map