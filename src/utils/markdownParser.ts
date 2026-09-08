import { Question, QuestionType } from "@/types/exam";

const parseCache = new Map<string, Question[]>();

export function parseMarkdownQuestions(markdown: string): Question[] {
  if (parseCache.has(markdown)) {
    return parseCache.get(markdown)!;
  }

  const questions: Question[] = [];
  const blocks = markdown.split(/(?=###\s+Question\s+\d+)/g);

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const headerMatch = trimmed.match(/###\s+Question\s+(\d+)\s*\((MCQ|MSQ|NAT)\)/i);
    if (!headerMatch) return;

    const id = parseInt(headerMatch[1], 10);
    const type = headerMatch[2].toUpperCase() as QuestionType;

    let mermaidChart: string | undefined;
    const mermaidMatch = trimmed.match(/```mermaid([\s\S]*?)```/);
    if (mermaidMatch) {
      mermaidChart = mermaidMatch[1].trim();
    }

    const cleanContent = trimmed
      .replace(/###\s+Question\s+\d+\s*\((MCQ|MSQ|NAT)\)/i, "")
      .replace(/```mermaid[\s\S]*?```/, "")
      .trim();

    const lines = cleanContent.split("\n");
    const promptLines: string[] = [];
    const options: { key: string; text: string }[] = [];
    const correctAnswers: string[] = [];

    lines.forEach((line) => {
      const l = line.trim();
      if (!l) return;

      const optMatch = l.match(/^-\s*([A-D])\)\s*(.*)/i);
      const correctMatch = l.match(/^-\s*(?:Correct|Answer):\s*(.*)/i);

      if (optMatch) {
        options.push({
          key: optMatch[1].toUpperCase(),
          text: optMatch[2].trim(),
        });
      } else if (correctMatch) {
        const rawAnswers = correctMatch[1].split(",");
        rawAnswers.forEach((ans) => {
          const sanitized = ans.trim().toUpperCase();
          if (sanitized) correctAnswers.push(sanitized);
        });
      } else {
        promptLines.push(l);
      }
    });

    questions.push({
      id,
      type,
      prompt: promptLines.join("\n").trim(),
      mermaidChart,
      options,
      correctAnswers,
    });
  });

  parseCache.set(markdown, questions);
  return questions;
}