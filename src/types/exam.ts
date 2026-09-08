export type ExamCategory =
  | "SSC"
  | "UPSC"
  | "GATE"
  | "Railways"
  | "Defence"
  | "Banking"
  | "State Exams"
  | "JEE";

export type QuestionType = "MCQ" | "MSQ" | "NAT";

export interface ExamItem {
  id: string;
  title: string;
  category: ExamCategory;
  subCategory?: string; // e.g. "SSC CGL", "SSC CHSL", "GS Paper 1", "CSAT"
  subject: string;
  chapter?: string;
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