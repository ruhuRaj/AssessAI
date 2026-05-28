"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPDFGenerationWorker = exports.startQuestionGenerationWorker = void 0;
const bullmq_1 = require("bullmq");
const AIService_1 = require("../services/AIService");
const QuestionPaper_1 = require("../models/QuestionPaper");
const CacheService_1 = require("../services/CacheService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConnection = {
    url: process.env.REDIS_URL,
};
const aiService = new AIService_1.AIService();
const startQuestionGenerationWorker = () => {
    const worker = new bullmq_1.Worker('question-generation', async (job) => {
        console.log(`Processing job ${job.id}:`, job.data);
        try {
            const { assignmentId, assignmentData } = job.data;
            // Generate questions
            const rawResponse = await aiService.generateQuestions(assignmentData);
            // Parse response
            const sections = aiService.parseAiResponse(rawResponse);
            // Replace any existing paper for this assignment
            await QuestionPaper_1.QuestionPaper.deleteMany({ assignmentId });
            const questionPaper = new QuestionPaper_1.QuestionPaper({
                assignmentId,
                sections,
                rawAiResponse: rawResponse,
                metadata: {
                    totalMarks: assignmentData.totalMarks,
                    totalQuestions: assignmentData.numberOfQuestions,
                    generationTime: Date.now() - job.timestamp,
                },
            });
            const saved = await questionPaper.save();
            // Cache the result
            await CacheService_1.cacheService.set(`paper:${assignmentId}`, saved, 60 * 60 * 24);
            // Emit job completion event
            await job.updateProgress(100);
            return {
                success: true,
                paperId: saved._id,
                assignmentId,
                sections: sections.length,
            };
        }
        catch (error) {
            console.error('Question generation job failed:', error);
            throw error;
        }
    }, { connection: redisConnection });
    worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
    });
    worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
    });
    console.log('✓ Question Generation Worker started');
    return worker;
};
exports.startQuestionGenerationWorker = startQuestionGenerationWorker;
const startPDFGenerationWorker = () => {
    const worker = new bullmq_1.Worker('pdf-generation', async (job) => {
        console.log(`Processing PDF job ${job.id}:`, job.data);
        try {
            const { paperId } = job.data;
            // Retrieve paper data
            const paper = await QuestionPaper_1.QuestionPaper.findById(paperId);
            if (!paper) {
                throw new Error(`Paper ${paperId} not found`);
            }
            // PDF generation logic here
            await job.updateProgress(100);
            return {
                success: true,
                paperId,
                pdfUrl: `/api/papers/${paperId}/pdf`,
            };
        }
        catch (error) {
            console.error('PDF generation job failed:', error);
            throw error;
        }
    }, { connection: redisConnection });
    worker.on('completed', (job) => {
        console.log(`PDF Job ${job.id} completed successfully`);
    });
    worker.on('failed', (job, err) => {
        console.error(`PDF Job ${job?.id} failed:`, err.message);
    });
    console.log('✓ PDF Generation Worker started');
    return worker;
};
exports.startPDFGenerationWorker = startPDFGenerationWorker;
//# sourceMappingURL=workers.js.map