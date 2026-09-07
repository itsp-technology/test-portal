type Question = {
  id: number;
  type: "MCQ" | "MSQ" | "NAT";
  prompt: string;
  mermaidChart?: string;
  options: { key: string; text: string }[];
  correctAnswers: string[];
};

export function parseMarkdownQuestions(rawMarkdown: string): Question[] {
  const parsed: Question[] = [];
  const blocks = rawMarkdown.split(/### Question\s+/).filter(Boolean);

  blocks.forEach((block) => {
    const matchHeader = block.match(/^(\d+)\s*\((MCQ|MSQ|NAT)\)/i);
    if (!matchHeader) return;

    const id = parseInt(matchHeader[1], 10);
    const type = matchHeader[2].toUpperCase() as Question["type"];

    let mermaidChart: string | undefined;
    const mermaidMatch = block.match(/```mermaid([\s\S]*?)```/);
    if (mermaidMatch) {
      mermaidChart = mermaidMatch[1].trim();
    }

    const lines = block
      .replace(/```mermaid[\s\S]*?```/, "")
      .split("\n")
      .slice(1);

    const promptLines: string[] = [];
    const options: { key: string; text: string }[] = [];
    let correctAnswers: string[] = [];

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      const optMatch = line.match(/^[-*]\s*([A-D])\)\s*(.*)/i);
      const correctMatch = line.match(/^[-*]?\s*Correct:\s*(.*)/i);
      const answerMatch = line.match(/^[-*]?\s*Answer:\s*(.*)/i);

      if (optMatch) {
        options.push({ key: optMatch[1].toUpperCase(), text: optMatch[2] });
      } else if (correctMatch) {
        correctAnswers = correctMatch[1].split(",").map((s) => s.trim().toUpperCase());
      } else if (answerMatch && type === "NAT") {
        correctAnswers = [answerMatch[1].trim()];
      } else if (line.length > 0 && !line.startsWith("###")) {
        promptLines.push(line);
      }
    });

    parsed.push({
      id,
      type,
      prompt: promptLines.join("\n"),
      mermaidChart,
      options,
      correctAnswers,
    });
  });

  return parsed;
}