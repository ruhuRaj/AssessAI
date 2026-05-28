import mongoose from 'mongoose';
interface IAssignment {
    title: string;
    description?: string;
    subject: string;
    totalMarks: number;
    numberOfQuestions: number;
    questionTypes: string[];
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    dueDate: Date;
    additionalInstructions?: string;
    fileUrl?: string;
    fileName?: string;
    referenceContent?: string;
    teacherId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Assignment: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment> & IAssignment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=Assignment.d.ts.map