import { Question, QuestionType } from "@/types/exam";

const parseCache = new Map<string, Question[]>();

export function parseMarkdownQuestions(markdown: string): Question[] {
  if (parseCache.has(markdown)) {
    return parseCache.get(markdown)!;
  }

  const questions: Question[] = [];
  // Splits by question headers: "### Question 1" or "## Question 1" or "Question 1"
  const blocks = markdown.split(/(?=(?:###|##)?\s*Question\s+\d+)/i);

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // Matches: "### Question 1 (MCQ)", "## Question 2 (NAT)", "Question 3 (MSQ)"
    const headerMatch = trimmed.match(/(?:###|##)?\s*Question\s+(\d+)\s*(?:\((MCQ|MSQ|NAT)\))?/i);
    if (!headerMatch) return;

    const id = parseInt(headerMatch[1], 10);
    let type: QuestionType = (headerMatch[2]?.toUpperCase() as QuestionType) || "MCQ";

    // Extract Mermaid diagrams if present
    let mermaidChart: string | undefined;
    const mermaidMatch = trimmed.match(/```mermaid([\s\S]*?)```/i);
    if (mermaidMatch) {
      mermaidChart = mermaidMatch[1].trim();
    }

    // Remove question header and code blocks from body
    const bodyWithoutHeader = trimmed
      .replace(/(?:###|##)?\s*Question\s+\d+\s*(?:\((?:MCQ|MSQ|NAT)\))?/i, "")
      .replace(/```mermaid[\s\S]*?```/gi, "")
      .trim();

    const lines = bodyWithoutHeader.split("\n");
    const promptLines: string[] = [];
    const options: { key: string; text: string }[] = [];
    const correctAnswers: string[] = [];

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      // 1. Match Answer Keys: "* Correct: A", "- Answer: 140", "Correct: A, B, C", "* Ans: 4"
      const correctMatch = line.match(/^(?:[*+-]\s*)?(?:Correct(?:\s*Answer)?|Answer|Ans):\s*(.*)/i);
      if (correctMatch) {
        const rawAnswers = correctMatch[1].split(",");
        rawAnswers.forEach((ans) => {
          const sanitized = ans.trim().toUpperCase();
          if (sanitized) correctAnswers.push(sanitized);
        });
        return;
      }

      // 2. Match Options: "* A) text", "- (B) text", "C) text", "* D. text"
      const optMatch = line.match(/^(?:[*+-]\s*)?(?:\(([A-D])\)|\b([A-D])[\).])\s*(.*)/i);
      if (optMatch) {
        const key = (optMatch[1] || optMatch[2]).toUpperCase();
        const text = (optMatch[3] || "").trim();
        options.push({ key, text });
        return;
      }

      // 3. Regular question prompt text
      promptLines.push(rawLine);
    });

    // Auto-detect NAT if no options were supplied
    if (options.length === 0 && type !== "NAT") {
      if (correctAnswers.length > 0 && !["A", "B", "C", "D"].includes(correctAnswers[0])) {
        type = "NAT";
      }
    }

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

// Fisher-Yates shuffle with sequential ID re-indexing (1, 2, 3...)
export function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((q, index) => ({
    ...q,
    id: index + 1,
  }));
}