import { Worker, Job } from 'bullmq';
import { AIService } from '../services/AIService';
import { QuestionPaper } from '../models/QuestionPaper';
import { cacheService } from '../services/CacheService';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const aiService = new AIService();

export const startQuestionGenerationWorker = () => {
  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      console.log(`Processing job ${job.id}:`, job.data);

      try {
        const { assignmentId, assignmentData } = job.data;

        // Generate questions
        const rawResponse = await aiService.generateQuestions(assignmentData);

        // Parse response
        const sections = aiService.parseAiResponse(rawResponse);

        // Replace any existing paper for this assignment
        await QuestionPaper.deleteMany({ assignmentId });

        const questionPaper = new QuestionPaper({
          assignmentId,
          sections,
          rawAiResponse: rawResponse,
          metadata: {
            totalMarks: assignmentData.totalMarks,
            totalQuestions: assignmentData.numberOfQuestions,
            generationTime: Date.now() - job.timestamp!,
          },
        });

        const saved = await questionPaper.save();

        // Cache the result
        await cacheService.set(
          `paper:${assignmentId}`,
          saved,
          60 * 60 * 24
        );

        // Emit job completion event
        await job.updateProgress(100);

        return {
          success: true,
          paperId: saved._id,
          assignmentId,
          sections: sections.length,
        };
      } catch (error) {
        console.error('Question generation job failed:', error);
        throw error;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log('✓ Question Generation Worker started');
  return worker;
};

export const startPDFGenerationWorker = () => {
  const worker = new Worker(
    'pdf-generation',
    async (job: Job) => {
      console.log(`Processing PDF job ${job.id}:`, job.data);

      try {
        const { paperId, metadata } = job.data;

        // Retrieve paper data
        const paper = await QuestionPaper.findById(paperId);

        if (!paper) {
          throw new Error(`Paper ${paperId} not found`);
        }

        // PDF generation would happen here
        // For now, just mark as completed
        await job.updateProgress(100);

        return {
          success: true,
          paperId,
          pdfUrl: `/api/papers/${paperId}/pdf`,
        };
      } catch (error) {
        console.error('PDF generation job failed:', error);
        throw error;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`PDF Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`PDF Job ${job?.id} failed:`, err.message);
  });

  console.log('✓ PDF Generation Worker started');
  return worker;
};
