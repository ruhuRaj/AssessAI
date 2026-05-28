"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Assignment_1 = require("../models/Assignment");
const QuestionPaper_1 = require("../models/QuestionPaper");
const queue_1 = require("../config/queue");
const CacheService_1 = require("../services/CacheService");
const PDFService_1 = require("../services/PDFService");
const errorHandler_1 = require("../middleware/errorHandler");
const upload_1 = require("../middleware/upload");
const fileExtract_1 = require("../utils/fileExtract");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
async function findOwnedAssignment(id, teacherId) {
    const assignment = await Assignment_1.Assignment.findById(id);
    if (!assignment)
        return null;
    if (assignment.teacherId !== teacherId)
        return 'forbidden';
    return assignment;
}
function parseQuestionTypes(value) {
    if (Array.isArray(value))
        return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch {
            return value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }
    return ['MCQ', 'Short Answer', 'Essay'];
}
function parseNumber(value) {
    return typeof value === 'number' ? value : Number(value);
}
const handleUpload = (req, res, next) => {
    (0, upload_1.uploadReferenceFile)(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : 'File upload failed';
            return res.status(400).json({ error: message });
        }
        next();
    });
};
// List assignments (newest first)
router.get('/assignments', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const assignments = await Assignment_1.Assignment.find({
        teacherId: req.user.id,
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    const assignmentIds = assignments.map((a) => String(a._id));
    const papers = await QuestionPaper_1.QuestionPaper.find({
        assignmentId: { $in: assignmentIds },
    })
        .select('assignmentId generatedAt')
        .lean();
    const paperByAssignment = new Map(papers.map((p) => [String(p.assignmentId), p]));
    const enriched = assignments.map((a) => ({
        ...a,
        hasPaper: paperByAssignment.has(String(a._id)),
        generatedAt: paperByAssignment.get(String(a._id))?.generatedAt,
    }));
    res.json({ success: true, assignments: enriched });
}));
// Create assignment (JSON or multipart with optional reference file)
router.post('/assignments', handleUpload, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, subject, totalMarks, numberOfQuestions, questionTypes, difficulty, dueDate, additionalInstructions, } = req.body;
    const marks = parseNumber(totalMarks);
    const questions = parseNumber(numberOfQuestions);
    if (!title || !subject || !marks || !questions) {
        return res.status(400).json({
            error: 'Missing required fields: title, subject, totalMarks, numberOfQuestions',
        });
    }
    if (marks <= 0 || questions <= 0) {
        return res.status(400).json({
            error: 'Marks and questions must be positive',
        });
    }
    if (!dueDate) {
        return res.status(400).json({
            error: 'Due date is required',
        });
    }
    let fileUrl;
    let fileName;
    let referenceContent;
    if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
        const raw = await (0, fileExtract_1.extractTextFromFile)(req.file.path, req.file.originalname);
        if (raw) {
            referenceContent = (0, fileExtract_1.truncateReferenceContent)(raw);
        }
    }
    const assignment = new Assignment_1.Assignment({
        title,
        description,
        subject,
        totalMarks: marks,
        numberOfQuestions: questions,
        questionTypes: parseQuestionTypes(questionTypes),
        difficulty: difficulty || 'mixed',
        dueDate: new Date(dueDate),
        additionalInstructions,
        fileUrl,
        fileName,
        referenceContent,
        teacherId: req.user.id,
    });
    await assignment.save();
    res.status(201).json({
        success: true,
        assignment,
    });
}));
// Upload / replace reference file for existing assignment
router.post('/assignments/:id/reference', handleUpload, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await findOwnedAssignment(req.params.id, req.user.id);
    if (!result) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (result === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    const assignment = result;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const raw = await (0, fileExtract_1.extractTextFromFile)(req.file.path, req.file.originalname);
    assignment.fileUrl = `/uploads/${req.file.filename}`;
    assignment.fileName = req.file.originalname;
    assignment.referenceContent = raw
        ? (0, fileExtract_1.truncateReferenceContent)(raw)
        : undefined;
    await assignment.save();
    res.json({ success: true, assignment });
}));
// Delete assignment
router.delete('/assignments/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await findOwnedAssignment(req.params.id, req.user.id);
    if (!result) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (result === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    await Assignment_1.Assignment.findByIdAndDelete(req.params.id);
    await QuestionPaper_1.QuestionPaper.deleteMany({ assignmentId: req.params.id });
    await CacheService_1.cacheService.delete(`paper:${req.params.id}`);
    res.json({ success: true });
}));
// Get assignment
router.get('/assignments/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await findOwnedAssignment(req.params.id, req.user.id);
    if (!result) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (result === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    res.json(result);
}));
// Generate questions
router.post('/assignments/:id/generate', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await findOwnedAssignment(req.params.id, req.user.id);
    if (!result) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (result === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    const assignment = result;
    const force = req.body?.force === true || req.query.force === 'true';
    if (!force) {
        const cached = await CacheService_1.cacheService.get(`paper:${req.params.id}`);
        if (cached) {
            return res.json({
                success: true,
                cached: true,
                paper: cached,
                assignmentId: req.params.id,
            });
        }
    }
    else {
        await CacheService_1.cacheService.delete(`paper:${req.params.id}`);
        await QuestionPaper_1.QuestionPaper.deleteMany({ assignmentId: req.params.id });
    }
    const fileContent = [
        assignment.referenceContent,
        assignment.description,
    ]
        .filter(Boolean)
        .join('\n\n');
    const job = await queue_1.questionGenerationQueue.add('generate', {
        assignmentId: req.params.id,
        assignmentData: {
            title: assignment.title,
            subject: assignment.subject,
            numberOfQuestions: assignment.numberOfQuestions,
            questionTypes: assignment.questionTypes,
            difficulty: assignment.difficulty,
            totalMarks: assignment.totalMarks,
            additionalInstructions: assignment.additionalInstructions,
            fileContent: fileContent || undefined,
        },
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    });
    res.json({
        success: true,
        jobId: job.id,
        message: 'Question generation started',
    });
}));
// Get job status
router.get('/jobs/:jobId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const job = await queue_1.questionGenerationQueue.getJob(req.params.jobId);
    if (!job) {
        return res.status(404).json({
            error: 'Job not found',
        });
    }
    const state = await job.getState();
    const progress = job.progress;
    res.json({
        jobId: job.id,
        state,
        progress,
        data: job.data,
        returnValue: job.returnvalue,
    });
}));
// Get question paper
router.get('/papers/:assignmentId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const owned = await findOwnedAssignment(req.params.assignmentId, req.user.id);
    if (!owned) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (owned === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    const paper = await QuestionPaper_1.QuestionPaper.findOne({
        assignmentId: req.params.assignmentId,
    }).sort({ generatedAt: -1 });
    if (!paper) {
        return res.status(404).json({ error: 'Question paper not found' });
    }
    res.json(paper);
}));
// Download question paper as PDF (server-generated)
router.get('/papers/:assignmentId/pdf', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const owned = await findOwnedAssignment(req.params.assignmentId, req.user.id);
    if (!owned) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    if (owned === 'forbidden') {
        return res.status(403).json({ error: 'Access denied' });
    }
    const paper = await QuestionPaper_1.QuestionPaper.findOne({
        assignmentId: req.params.assignmentId,
    }).sort({ generatedAt: -1 });
    if (!paper) {
        return res.status(404).json({ error: 'Question paper not found' });
    }
    const assignment = owned;
    const stream = PDFService_1.pdfService.generateQuestionPaperPDF(paper.sections, {
        title: assignment?.title || 'Question Paper',
        subject: assignment?.subject || 'General',
        totalMarks: paper.metadata.totalMarks,
    });
    const filename = `${(assignment?.title || 'question-paper')
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
}));
exports.default = router;
//# sourceMappingURL=assignments.js.map