"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const assignmentSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    subject: {
        type: String,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 1,
    },
    numberOfQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    questionTypes: {
        type: [String],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'mixed'],
        default: 'mixed',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    additionalInstructions: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
    },
    referenceContent: {
        type: String,
    },
    teacherId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    },
});
assignmentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.Assignment = mongoose_1.default.model('Assignment', assignmentSchema);
//# sourceMappingURL=Assignment.js.map