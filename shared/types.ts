/**
 * Shared types across backend and frontend
 */

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  sectionId: string;
  options?: string[];
  type?: string;
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
  _id?: string;
  assignmentId: string;
  sections: Section[];
  rawAiResponse?: string;
  generatedAt: Date;
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    generationTime?: number;
  };
}

export interface GenerationJob {
  jobId: string;
  state: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  returnValue?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
