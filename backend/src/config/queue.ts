import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = {
  url: process.env.REDIS_URL,
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