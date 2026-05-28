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

const questionPaperSchema = new mongoose.Schema<IQuestionPaper>({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
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

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  'QuestionPaper',
  questionPaperSchema
);
