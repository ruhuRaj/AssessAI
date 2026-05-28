import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const questionGenerationQueue = new Queue('question-generation', {
  connection: redisConnection,
});

export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection: redisConnection,
});

export const initializeQueues = async () => {
  console.log('✓ BullMQ queues initialized');
};
