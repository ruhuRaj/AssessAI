import { QuestionPaper } from '@/types';

export function getPaperStats(paper: QuestionPaper) {
  const questions = paper.sections.flatMap((s) => s.questions);
  return {
    totalQuestions: questions.length,
    totalMarks: questions.reduce((s, q) => s + q.marks, 0),
    mcqCount: questions.filter((q) => q.options && q.options.length > 0).length,
  };
}
