export type ExamCategory = "GATE" | "UPSC" | "SSC CGL" | "JEE" | "Defence";
export type QuestionType = "MCQ" | "MSQ" | "NAT";

export interface ExamItem {
  id: string;
  title: string;
  category: ExamCategory;
  subject: string;
  totalQuestions: number;
  durationMins: number;
  maxMarks: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  badge?: string;
  isFree: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  mermaidChart?: string;
  options: { key: string; text: string }[];
  correctAnswers: string[];
}

export interface ExamResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
}