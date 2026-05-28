export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

export interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id?: string;
  hasPaper?: boolean;
  title: string;
  description?: string;
  subject: string;
  totalMarks: number;
  numberOfQuestions: number;
  questionTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  dueDate: string | Date;
  additionalInstructions?: string;
  fileUrl?: string;
  fileName?: string;
  referenceContent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  rawAiResponse: string;
  generatedAt: Date;
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    generationTime: number;
  };
}

export interface GenerationJob {
  jobId: string;
  state: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  returnValue?: any;
}
