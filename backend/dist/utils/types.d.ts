export interface Question {
    id: string;
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
    marks: number;
    sectionId: string;
}
export interface Section {
    id: string;
    title: string;
    instructions: string;
    questions: Question[];
}
export interface AssignmentInput {
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
}
export interface GeneratedPaper {
    id: string;
    assignmentId: string;
    sections: Section[];
    generatedAt: Date;
    metadata: {
        totalMarks: number;
        totalQuestions: number;
    };
}
//# sourceMappingURL=types.d.ts.map