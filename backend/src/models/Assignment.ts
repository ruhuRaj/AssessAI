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

const assignmentSchema = new mongoose.Schema<IAssignment>({
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

export const Assignment = mongoose.model<IAssignment>(
  'Assignment',
  assignmentSchema
);
