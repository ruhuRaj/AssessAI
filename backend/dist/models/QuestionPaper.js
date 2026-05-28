"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionPaper = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const questionPaperSchema = new mongoose_1.default.Schema({
    assignmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    sections: {
        type: [
            {
                id: String,
                title: String,
                instructions: String,
                questions: [
                    {
                        id: String,
                        text: String,
                        difficulty: {
                            type: String,
                            enum: ['easy', 'medium', 'hard'],
                        },
                        marks: Number,
                        options: [String],
                        correctAnswer: String,
                    },
                ],
            },
        ],
        required: true,
    },
    rawAiResponse: {
        type: String,
        required: true,
    },
    generatedAt: {
        type: Date,
        default: () => new Date(),
    },
    metadata: {
        totalMarks: Number,
        totalQuestions: Number,
        generationTime: Number,
    },
});
exports.QuestionPaper = mongoose_1.default.model('QuestionPaper', questionPaperSchema);
//# sourceMappingURL=QuestionPaper.js.map