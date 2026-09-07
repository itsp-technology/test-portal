"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExamItem, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { MermaidRenderer } from "@/components/MermaidRenderer";
import {
  Clock,
  Send,
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [natInputs, setNatInputs] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [timeLeft, setTimeLeft] = useState<number>(exam.durationMins * 60);

  // Keep references to latest user answers for auto-submission without breaking the interval
  const answersRef = useRef({ selectedAnswers, natInputs });
  answersRef.current = { selectedAnswers, natInputs };

  // Timer: Starts once on mount, does NOT restart on user answers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmit]);

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

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                onExit();
              }
            }}
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
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black shadow-inner">
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
          <button
            onClick={() => onSubmit({ selectedAnswers, natInputs })}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
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
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
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
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Enter Numerical Value (NAT):
                  </label>
                  <input
                    type="number"
                    value={natInputs[currentQ?.id || 0] || ""}
                    onChange={(e) => handleNatChange(e.target.value)}
                    placeholder="Type answer here..."
                    className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 mt-6 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentQ) {
                    setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
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
                    const c = { ...prev };
                    delete c[currentQ.id];
                    return c;
                  });
                  if (currentQ.type === "NAT") {
                    setNatInputs((prev) => {
                      const c = { ...prev };
                      delete c[currentQ.id];
                      return c;
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
                    setVisited((prev) => ({ ...prev, [next]: true }));
                  }
                }}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <span className="font-black text-slate-900 text-xs tracking-wider uppercase block">
            Question Palette
          </span>

          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = (selectedAnswers[q.id] || []).length > 0;
              const isMarked = markedForReview[q.id];
              const isCurrent = currentIndex === idx;

              let badgeStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200";
              if (isMarked) {
                badgeStyle = "bg-purple-600 text-white";
              } else if (isAnswered) {
                badgeStyle = "bg-emerald-600 text-white";
              } else if (visited[idx]) {
                badgeStyle = "bg-rose-50 text-rose-500 border border-rose-200";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setVisited((prev) => ({ ...prev, [idx]: true }));
                  }}
                  className={`h-11 w-11 rounded-2xl font-bold text-xs flex items-center justify-center transition cursor-pointer ${badgeStyle} ${
                    isCurrent
                      ? "ring-2 ring-blue-600 ring-offset-2 !bg-white !text-blue-600 border border-blue-600 font-black"
                      : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-rose-200" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-purple-600" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-slate-200" />
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};