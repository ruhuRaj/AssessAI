import mongoose from 'mongoose';
interface IQuestionPaper {
    assignmentId: mongoose.Types.ObjectId;
    sections: Array<{
        id: string;
        title: string;
        instructions: string;
        questions: Array<{
            id: string;
            text: string;
            difficulty: 'easy' | 'medium' | 'hard';
            marks: number;
            options?: string[];
            correctAnswer?: string;
        }>;
    }>;
    rawAiResponse: string;
    generatedAt: Date;
    metadata: {
        totalMarks: number;
        totalQuestions: number;
        generationTime: number;
    };
}
export declare const QuestionPaper: mongoose.Model<IQuestionPaper, {}, {}, {}, mongoose.Document<unknown, {}, IQuestionPaper> & IQuestionPaper & {
    _id: mongoose.Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=QuestionPaper.d.ts.map