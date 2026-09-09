"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ExamItem, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { QuestionPalette } from "@/components/QuestionPalette";
import { ExamTimer } from "@/components/ExamTimer";
import {
  Send,
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MermaidRenderer = dynamic(
  () => import("@/components/MermaidRenderer").then((m) => m.MermaidRenderer),
  { ssr: false }
);

interface CBTExamEngineProps {
  exam: ExamItem;
  questions: Question[];
  onExit: () => void;
  onSubmit: (data: {
    selectedAnswers: Record<number, string[]>;
    natInputs: Record<number, string>;
  }) => void;
}

export const CBTExamEngine: React.FC<CBTExamEngineProps> = ({
  exam,
  questions,
  onExit,
  onSubmit,
}) => {
  const storageKey = `cbt_exam_state_${exam.id}`;

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(`${storageKey}_index`);
    return saved ? Number(saved) : 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  const [natInputs, setNatInputs] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_nat`);
    return saved ? JSON.parse(saved) : {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_review`);
    return saved ? JSON.parse(saved) : {};
  });

  const [visited, setVisited] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return { 0: true };
    const saved = localStorage.getItem(`${storageKey}_visited`);
    return saved ? JSON.parse(saved) : { 0: true };
  });

  const answersRef = useRef({ selectedAnswers, natInputs });

  // Asynchronous storage sync: updates storage without locking the UI thread
  useEffect(() => {
    answersRef.current = { selectedAnswers, natInputs };
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`${storageKey}_index`, currentIndex.toString());
      localStorage.setItem(`${storageKey}_answers`, JSON.stringify(selectedAnswers));
      localStorage.setItem(`${storageKey}_nat`, JSON.stringify(natInputs));
      localStorage.setItem(`${storageKey}_review`, JSON.stringify(markedForReview));
      localStorage.setItem(`${storageKey}_visited`, JSON.stringify(visited));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, selectedAnswers, natInputs, markedForReview, visited, storageKey]);

  // Intercept reload keys & unload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const clearSessionStorage = useCallback(() => {
    localStorage.removeItem(`${storageKey}_index`);
    localStorage.removeItem(`${storageKey}_answers`);
    localStorage.removeItem(`${storageKey}_nat`);
    localStorage.removeItem(`${storageKey}_review`);
    localStorage.removeItem(`${storageKey}_visited`);
    localStorage.removeItem(`${storageKey}_time`);
    localStorage.removeItem("cbt_active_exam_id");
  }, [storageKey]);

  const handleExitExam = () => {
    if (confirm("Are you sure you want to exit? Your exam progress will be cleared.")) {
      clearSessionStorage();
      onExit();
    }
  };

  const handleSubmitExam = useCallback(() => {
    clearSessionStorage();
    onSubmit(answersRef.current);
  }, [clearSessionStorage, onSubmit]);

  const handleSelectQuestionIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setVisited((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, []);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = useCallback((key: string) => {
    if (!currentQ) return;
    if (currentQ.type === "MCQ") {
      setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: [key] }));
    } else if (currentQ.type === "MSQ") {
      setSelectedAnswers((prev) => {
        const current = prev[currentQ.id] || [];
        const next = current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key];
        return { ...prev, [currentQ.id]: next };
      });
    }
  }, [currentQ]);

  const handleNatChange = useCallback((val: string) => {
    if (!currentQ) return;
    setNatInputs((prev) => ({ ...prev, [currentQ.id]: val }));
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: val ? [val] : [] }));
  }, [currentQ]);

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between"
    >
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitExam}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
              {exam.title}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold">
              Question {currentIndex + 1} of {questions.length} • Max Marks: {exam.maxMarks}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExamTimer
            storageKey={storageKey}
            initialMinutes={exam.durationMins}
            onTimeUp={handleSubmitExam}
          />
          <button
            onClick={handleSubmitExam}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        <section className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 select-none">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                Question {currentIndex + 1}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {currentQ?.type} • +2 Marks
              </span>
            </div>

            <div className="text-sm sm:text-base leading-relaxed text-slate-800 space-y-3 font-normal">
              {currentQ && <MathText content={currentQ.prompt} />}
            </div>

            {currentQ?.mermaidChart && <MermaidRenderer chart={currentQ.mermaidChart} />}

            <div className="mt-6 space-y-3">
              {currentQ && currentQ.type !== "NAT" ? (
                currentQ.options.length > 0 ? (
                  currentQ.options.map((opt) => {
                    const isChecked = (selectedAnswers[currentQ.id] || []).includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleOptionSelect(opt.key)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 text-xs sm:text-sm cursor-pointer ${
                          isChecked
                            ? "border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                            isChecked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
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
                  <div className="text-xs text-amber-600 italic">No options available.</div>
                )
              ) : (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-600 mb-2 select-none">
                    Enter Numerical Value (NAT):
                  </label>
                  <input
                    type="number"
                    value={natInputs[currentQ?.id || 0] || ""}
                    onChange={(e) => handleNatChange(e.target.value)}
                    placeholder="Type answer here..."
                    className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 mt-6 gap-2 select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentQ) {
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [currentQ.id]: !prev[currentQ.id],
                    }));
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentQ && markedForReview[currentQ.id]
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {currentQ && markedForReview[currentQ.id] ? "Marked" : "Mark Review"}
              </button>
              <button
                onClick={() => {
                  if (!currentQ) return;
                  setSelectedAnswers((prev) => {
                    const next = { ...prev };
                    delete next[currentQ.id];
                    return next;
                  });
                  if (currentQ.type === "NAT") {
                    setNatInputs((prev) => {
                      const next = { ...prev };
                      delete next[currentQ.id];
                      return next;
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    const next = currentIndex + 1;
                    setCurrentIndex(next);
                    setVisited((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
                  }
                }}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          selectedAnswers={selectedAnswers}
          markedForReview={markedForReview}
          visited={visited}
          onSelect={handleSelectQuestionIndex}
        />
      </div>
    </div>
  );
};