"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import katex from "katex";
import mermaid from "mermaid";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  Trophy,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";

// --- RAW MARKDOWN DATA (Paste your questions directly here) ---
const RAW_MARKDOWN = `
### Question 1 (MSQ)
Let $A = \\{\\emptyset, 1, \\{1\\}\\}$ and the power set of $A$ is denoted by $P(A)$, then which of the following statement is/are true?
- A) $\\emptyset \\in P(A)$ and $\\emptyset \\in A$
- B) $\\{\\emptyset, \\{1\\}\\} \\subseteq P(A)$ and $\\{\\emptyset, \\{1\\}\\} \\subseteq A$
- C) $A \\cap P(A) = \\emptyset$
- D) $A \\cup P(A) = P(A)$
- Correct: A, B

### Question 2 (MSQ)
Let $A = \\{\\emptyset, \\{1\\}, \\{\\emptyset\\}, \\{1, \\emptyset\\}\\}$ and $B = \\emptyset$ then which of the following statement is/are True? [Assume $P(A)$ represents the power set of $A$]
- A) $B \\in A$ and $B \\subseteq A$
- B) $A \\cap B = A \\times B$
- C) $|A \\cup B| = |A|$ and $|A \\cap B| = 1$
- D) $(A - B) = P(\\{\\emptyset, 1\\})$
- Correct: A, B, D

### Question 3 (MSQ)
Consider the following Venn diagram for the set $X$:

\`\`\`mermaid
flowchart LR
    subgraph U ["Universal Set U"]
        direction LR
        A["A - B<br/>(Shaded: Only A)"]
        AB["A ∩ B<br/>(Unshaded)"]
        B["B - A<br/>(Shaded: Only B)"]
        A --- AB --- B
    end
    style A fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff
    style B fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff
    style AB fill:#ffffff,stroke:#0f172a,stroke-width:2px,color:#000
    style U fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#000
\`\`\`

Which of the following expression(s) represents the shaded area of above diagram?
* A) $(A \\cup B) - (A \\cap B)$
* B) $(A \\oplus B)$
* C) $(A - B) \\cup (B - A)$
* D) $A \\cup (B - A)$
* Correct: A, B, C

### Question 4 (MSQ)
Consider a set $A = \\{1, 2\\}$ and if $R$ is a binary relation on $A$ then which of the following statement is/are true?
* A) $R$ is always transitive relation on $A$.
* B) If $R = \\{(1, 2), (2, 1)\\}$ then it is irreflexive relation on $A$.
* C) If $R = \\{(1, 2)\\}$ then it is transitive relation on $A$.
* D) If $R = \\{(1, 1), (2, 2)\\}$ then $R$ is an equivalence relation on $A$.
* Correct: B, C, D

### Question 5 (MSQ)
Which of the following expression(s) is/are equivalent to $(A - B) \\cup (B \\cap \\overline{A})$?
* A) $(A \\cup B) - (A \\cap B)$
* B) $(B - A) \\cup (A - B)$
* C) $[A - (A \\cap B)] \\cup [B - (A \\cap B)]$
* D) $(\\overline{\\overline{A} \\cap \\overline{B}}) - A$
* Correct: A, B, C

### Question 6 (NAT)
How many subset of $X = \\{\\emptyset, \\{\\emptyset\\}, \\{1\\}\\}$ are power set of any set?
* Answer: 3
* Correct: 3

### Question 7 (NAT)
Consider the following three sets:
$A = \\{x \\in \\mathbb{N} \\mid 1 \\le x \\le 600 \\text{ and } x \\text{ is divisible by } 2\\}$
$B = \\{x \\in \\mathbb{N} \\mid 1 \\le x \\le 600 \\text{ and } x \\text{ is divisible by } 3\\}$
$S = (\\overline{A} \\cap \\overline{B})$
Then what is the cardinality of $S$?
* Answer: 200
* Correct: 200

### Question 8 (NAT)
How many subset of $X = [1, 2, 3, 4, 5, 6, 7]$ contains only odd integer and odd number of elements?
* Answer: 8
* Correct: 8

### Question 9 (NAT)
Let $A, B, C$ be the three subsets of $S$ such that:
$|A \\cup B \\cup C| = 100$,
$|A \\cap B| = 20$,
$|A \\cap C| = 15$,
$|B \\cap C| = 10$,
$|A \\cap B \\cap C| = 5$.
What is the value of $|A| + |B| + |C|$?
* Answer: 140
* Correct: 140

### Question 10 (MCQ)
If $A$ and $B$ are two finite sets then which one of the following statement is true?
* A) $|A \\times B| = |B| \\times |A|$
* B) If $A = \\{\\emptyset\\}$ and $B = \\{1\\}$ then $|A \\times B| = 0$.
* C) If $A = \\emptyset$ then number of binary relation on $A$ is 0.
* D) If $|P(A)|$ is 64 and $|P(B)| = 16$ then $|A \\cup B| = 10$
* Correct: A

### Question 11 (NAT)
Let $A = \\{1, 2, 3, 4, 5\\}$ then how many non-empty subset of $A \\times A$ contains only self-pair?
* Answer: 31
* Correct: 31

### Question 12 (NAT)
Let $A = [1, 2, 3, 4\\}$ then how many binary relations on $A$ are there which are reflexive and symmetric both?
* Answer: 64
* Correct: 64

### Question 13 (MCQ)
Let $R = \\{(1, 2), (2, 3), (3, 4), (4, 1)\\}$ is a binary relation on $A = \\{1, 2, 3, 4\\}$ then what is the cardinality of transitive closure of $R$?
* A) 12
* B) 4
* C) 16
* D) 3
* Correct: C

### Question 14 (MSQ)
Which of the following statement is/are true? [Assume the $\\oplus$ operator represents symmetric difference]
* A) $A \\oplus B = B \\oplus A$
* B) $(A - B) - C = A - (B - C)$
* C) $(A \\oplus B) \\oplus C = A \\oplus (B \\oplus C)$
* D) $(A \\oplus A) - B = (B \\oplus B) - A$
* Correct: A, C, D

### Question 15 (MSQ)
Which of the following statement is/are true?
* A) If $A \\subseteq B$ then $\\overline{A \\cup B} = \\overline{(A \\cap B) \\cup B}$
* B) If $A \\cup B = A \\text{ then } B \\subseteq A$
* C) If $A \\cap B = \\emptyset \\text{ then } |A \\cup B| = |A| + |B|$
* D) If $A$ is non-empty set then $|A \\cup P(A)| = |A| + |P(A)|$
* Correct: A, B, C

### Question 16 (MSQ)
Consider the following binary relation on the set of integers:
$R = \\{(a, b) \\mid a + b \\le 4\\}$
Which of the following statement is/are true?
* A) $R$ is reflexive, symmetric but not transitive.
* B) $R$ is not reflexive but transitive.
* C) $R$ is neither transitive, nor reflexive nor irreflexive.
* D) $R$ is symmetric but not irreflexive
* Correct: C, D

### Question 17 (NAT)
Let $A = \\{1, 2, 3, 4\\}$ then how many equivalence relations $R$ on set $A$ are possible such that the pair $(1, 2)$ always belongs to $R$?
* Answer: 5
* Correct: 5

### Question 18 (NAT)
In a renowned software development company of 240 computer programmers 102 employees are proficient in Java, 86 in C#, 126 in Python, 41 in C# and Java, 37 in Java and Python, 23 in C# and Python, and just 10 programmers are proficient in all three languages. How many computer programmers are there those are not proficient in any of these three languages?
* Answer: 17
* Correct: 17

### Question 19 (NAT)
Let $R$ be an equivalence relation on $A = \\{1, 2, 3, 4, 5, 6\\}$ with three equivalence classes: $(1, 2, 3), (4, 5), (6)$ then what is cardinality of $R$?
* Answer: 14
* Correct: 14

### Question 20 (NAT)
Let $R_1$ and $R_2$ be two binary relation on $A = \\{1, 2, 3\\}$ such that:
$R_1 = \\{(1, 2), (2, 3), (3, 2)\\}$
$R_2 = \\{(2, 1), (2, 3), (2, 2)\\}$
Than what the value of $|R_1 \\oplus R_2|$?
* Answer: 4
* Correct: 4

### Question 21 (NAT)
Consider a set $A = \\{1, 2, 3, 4\\}$. How many binary relation $R$ on $A$ are there such that:
* $(1, 3) \\in R$
* $(1, 4) \\notin R$
* $R$ is reflexive?
* Answer: 1024
* Correct: 1024

### Question 22 (MSQ)
Which of these collections of subsets are partitions of set $A = \\{1, 2, 3, 4, 5, 6\\}$?
* A) $\\{1, 2\\}, \\{2, 3, 4\\}, \\{4, 5, 6\\}$
* B) $\\{1\\}, \\{2, 3, 5\\}, \\{4\\}, \\{6\\}$
* C) $\\{1, 2, 3\\}, \\{4, 5\\}, \\{6\\}, \\emptyset$
* D) $\\{1, 2, 3, 4, 5, 6\\}$
* Correct: B, D

### Question 23 (MSQ)
Consider the following Relation Matrix of Relation $R$, defined on $A = \\{1, 2, 3, 4, 5\\}$:

$$M_R = \\begin{bmatrix}
1 & 1 & 1 & 0 & 0 \\\\
1 & 1 & 1 & 0 & 0 \\\\
1 & 1 & 1 & 0 & 0 \\\\
0 & 0 & 0 & 1 & 1 \\\\
0 & 0 & 0 & 1 & 1
\\end{bmatrix}$$

Which of the following statement is/are true?
* A) $R$ is transitive relation
* B) $R$ is an equivalence relation.
* C) $R$ has three equivalence classes.
* D) $R$ is asymmetric.
* Correct: A, B

### Question 24 (MSQ)
Let $R = \\{(1, 1), (2, 2), (1, 2), (2, 1), (3, 2)\\}$ be a binary relation defined on $A = \\{1, 2, 3\\}$ then which of the following statement is/are true.
* A) $R$ is neither reflexive nor irreflexive
* B) $R$ is neither symmetric nor anti-symmetric.
* C) $R$ is transitive.
* D) The complement of $R$ is asymmetric.
* Correct: A, B

### Question 25 (MCQ)
If we select one element $R$ from power set of $A \\times A$ at random where $A = \\{1, 2, 3\\}$ then what is probability that $R$ is reflexive but not anti-symmetric?
* A) 37/512
* B) 289/512
* C) 259/512
* D) 27/512
* Correct: A
`;

// --- TYPES ---
type QuestionType = "MCQ" | "MSQ" | "NAT";

interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  mermaidChart?: string;
  options: { key: string; text: string }[];
  correctAnswers: string[];
}

// --- HELPER COMPONENT: LATEX FORMULA RENDERER ---
const MathText: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  const renderedHTML = useMemo(() => {
    if (!content) return "";
    let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq, { displayMode: true, throwOnError: false });
      } catch {
        return eq;
      }
    });
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq, { displayMode: false, throwOnError: false });
      } catch {
        return eq;
      }
    });
    return processed.replace(/\n/g, "<br/>");
  }, [content]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: renderedHTML }} />;
};

// --- HELPER COMPONENT: MERMAID DIAGRAM RENDERER ---
const MermaidRenderer: React.FC<{ chart: string }> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: "neutral" });
      mermaid.run({ nodes: [containerRef.current] });
    }
  }, [chart]);

  return (
    <div className="my-4 p-4 bg-white border border-slate-200 rounded-2xl flex justify-center shadow-inner">
      <div ref={containerRef} className="mermaid">
        {chart}
      </div>
    </div>
  );
};

// --- MAIN CBT EXAM APPLICATION ---
export default function ExamEngine() {
  const [questions] = useState<Question[]>(() => {
    const parsed: Question[] = [];
    const blocks = RAW_MARKDOWN.split(/### Question\s+/).filter(Boolean);

    blocks.forEach((block) => {
      const matchHeader = block.match(/^(\d+)\s*\((MCQ|MSQ|NAT)\)/i);
      if (!matchHeader) return;

      const id = parseInt(matchHeader[1], 10);
      const type = matchHeader[2].toUpperCase() as QuestionType;
      let mermaidChart: string | undefined;
      const mermaidMatch = block.match(/```mermaid([\s\S]*?)```/);
      if (mermaidMatch) mermaidChart = mermaidMatch[1].trim();

      const lines = block.replace(/```mermaid[\s\S]*?```/, "").split("\n").slice(1);
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

      parsed.push({ id, type, prompt: promptLines.join("\n"), mermaidChart, options, correctAnswers });
    });
    return parsed;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [natInputs, setNatInputs] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* Markdown parsing is performed in the questions state initializer above. */
  /*
  useEffect(() => {
    const parsed: Question[] = [];
    const blocks = RAW_MARKDOWN.split(/### Question\s+/).filter(Boolean);

    blocks.forEach((block) => {
      const matchHeader = block.match(/^(\d+)\s*\((MCQ|MSQ|NAT)\)/i);
      if (!matchHeader) return;

      const id = parseInt(matchHeader[1], 10);
      const type = matchHeader[2].toUpperCase() as QuestionType;

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

    setQuestions(parsed);
  }, []);*/

  // Timer Tick
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (key: string) => {
    if (!currentQ) return;
    if (currentQ.type === "MCQ") {
      setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: [key] }));
    } else if (currentQ.type === "MSQ") {
      const current = selectedAnswers[currentQ.id] || [];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: next }));
    }
  };

  const handleNatChange = (val: string) => {
    if (!currentQ) return;
    setNatInputs((prev) => ({ ...prev, [currentQ.id]: val }));
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: val ? [val] : [] }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setVisited((prev) => ({ ...prev, [nextIdx]: true }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const clearResponse = () => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    if (currentQ.type === "NAT") {
      setNatInputs((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
    }
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Result Calculations
  const results = useMemo(() => {
    if (!isSubmitted) return null;
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const ans = selectedAnswers[q.id] || [];
      if (ans.length === 0) {
        unattemptedCount++;
      } else {
        const sortedAns = [...ans].sort().join(",");
        const sortedCorrect = [...q.correctAnswers].sort().join(",");
        if (sortedAns === sortedCorrect) {
          correctCount++;
          score += 2; // +2 for correct
        } else {
          incorrectCount++;
          // Negative marking only on MCQ (-0.66), zero negative marking on MSQ & NAT
          if (q.type === "MCQ") {
            score -= 0.66;
          }
        }
      }
    });

    const accuracy = correctCount + incorrectCount > 0 
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
      : 0;

    return { score: Math.max(0, parseFloat(score.toFixed(2))), correctCount, incorrectCount, unattemptedCount, accuracy };
  }, [isSubmitted, questions, selectedAnswers]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500 font-semibold text-sm">
        Parsing Examination Paper...
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (isSubmitted && results) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Attempt Analysis</span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Discrete Mathematics & Sets Mock</h1>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-attempt
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Score (Max 50)</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{results.score}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Accuracy</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{results.accuracy}%</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Correct</span>
              <p className="text-3xl font-black text-slate-800 mt-1">{results.correctCount}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Incorrect</span>
              <p className="text-3xl font-black text-rose-500 mt-1">{results.incorrectCount}</p>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Question Breakdown</h3>
            {questions.map((q) => {
              const userAns = selectedAnswers[q.id] || [];
              const isCorrect = [...userAns].sort().join(",") === [...q.correctAnswers].sort().join(",");
              const isAttempted = userAns.length > 0;

              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Q{q.id} ({q.type})</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        !isAttempted
                          ? "bg-slate-100 text-slate-500"
                          : isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {!isAttempted ? "Unattempted" : isCorrect ? "Correct (+2)" : "Incorrect"}
                    </span>
                  </div>
                  <MathText content={q.prompt} className="text-slate-800" />
                  <div className="text-[11px] pt-2 border-t border-slate-100 text-slate-600 flex gap-4">
                    <span>Your: <strong className="text-slate-800">{userAns.join(", ") || "None"}</strong></span>
                    <span>Correct: <strong className="text-emerald-700">{q.correctAnswers.join(", ")}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- CBT INTERFACE VIEW ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top App Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
            CBT
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">Discrete Mathematics</h2>
            <p className="text-[11px] text-slate-400">Total Questions: {questions.length} • Max Marks: 50</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-inner">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
          <button
            onClick={handleSubmitTest}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" /> Submit Test
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Question Board (Left) */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {currentQ.type} • +2 Marks
              </span>
            </div>

            {/* Question Text */}
            <div className="text-sm md:text-base leading-relaxed text-slate-800 space-y-3 font-normal">
              <MathText content={currentQ.prompt} />
            </div>

            {/* Mermaid Diagram if Present */}
            {currentQ.mermaidChart && <MermaidRenderer chart={currentQ.mermaidChart} />}

            {/* Options or NAT Input */}
            <div className="mt-6 space-y-2.5">
              {currentQ.type !== "NAT" ? (
                currentQ.options.map((opt) => {
                  const isChecked = (selectedAnswers[currentQ.id] || []).includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleOptionSelect(opt.key)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 text-xs md:text-sm ${
                        isChecked
                          ? "border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isChecked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.key}
                      </div>
                      <div className="flex-1">
                        <MathText content={opt.text} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Enter Numerical Value (NAT):
                  </label>
                  <input
                    type="number"
                    value={natInputs[currentQ.id] || ""}
                    onChange={(e) => handleNatChange(e.target.value)}
                    placeholder="Type number answer here..."
                    className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 mt-6 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkForReview}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  markedForReview[currentQ.id]
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {markedForReview[currentQ.id] ? "Marked" : "Mark Review"}
              </button>
              <button
                onClick={clearResponse}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                Save & Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Right) */}
        <div className="w-full md:w-72 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <span className="font-extrabold text-slate-900 text-xs tracking-wide uppercase block">
            Question Palette
          </span>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = (selectedAnswers[q.id] || []).length > 0;
              const isMarked = markedForReview[q.id];
              const isCurrent = currentIndex === idx;

              let btnColor = "bg-slate-100 text-slate-600";
              if (isMarked) {
                btnColor = "bg-purple-600 text-white";
              } else if (isAnswered) {
                btnColor = "bg-emerald-600 text-white";
              } else if (visited[idx]) {
                btnColor = "bg-rose-50 text-rose-600 border border-rose-200";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setVisited((prev) => ({ ...prev, [idx]: true }));
                  }}
                  className={`h-9 w-9 rounded-xl font-black text-xs transition ${btnColor} ${
                    isCurrent ? "ring-2 ring-offset-2 ring-blue-600" : ""
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="border-t border-slate-100 pt-4 space-y-1.5 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-emerald-600 inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-rose-100 border border-rose-300 inline-block" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-purple-600 inline-block" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-slate-100 inline-block" />
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}