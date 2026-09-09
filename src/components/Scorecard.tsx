"use client";

import React, { useState } from "react";
import { ExamItem, ExamResult, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ScorecardProps {
  exam: ExamItem;
  results: ExamResult;
  questions: Question[];
  selectedAnswers: Record<number, string[]>;
  onReattempt: () => void;
  onReturnHome: () => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  exam,
  results,
  questions,
  selectedAnswers,
  onReattempt,
  onReturnHome,
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-8 transition-colors duration-150">
      <main className="max-w-4xl w-full mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReturnHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tests</span>
          </button>
          <ThemeToggle variant="portal" />
        </div>

        {/* Hero Scorecard */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 rounded-md">
              Test Completed
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
              {exam.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Score</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {results.score} <span className="text-xs font-normal text-slate-400">/ {exam.maxMarks}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {results.correctCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Incorrect</p>
              <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                {results.incorrectCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Accuracy</p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {results.accuracy}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onReattempt}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reattempt Paper</span>
            </button>
            <button
              onClick={() => setShowReview(!showReview)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161f33] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{showReview ? "Hide Solutions" : "Detailed Solutions"}</span>
              {showReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Detailed Solutions Review */}
        {showReview && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Question Breakdown & Answer Key
            </h2>

            {questions.map((q, idx) => {
              const userAns = selectedAnswers[q.id] || [];
              const isCorrect =
                userAns.length > 0 &&
                [...userAns].sort().join(",") === [...q.correctAnswers].sort().join(",");
              const isUnattempted = userAns.length === 0;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-bold">
                    <span className="text-blue-600 dark:text-blue-400 font-black uppercase">
                      Question {idx + 1} ({q.type})
                    </span>
                    {isUnattempted ? (
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Unattempted</span>
                    ) : isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect ({q.type === "MCQ" ? "-0.66" : "0"})
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    <MathText content={q.prompt} />
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = userAns.includes(opt.key);
                        const isCorrectKey = q.correctAnswers.includes(opt.key);

                        let optBg = "bg-slate-50 dark:bg-[#161f33] border-slate-200 dark:border-slate-800";
                        if (isCorrectKey) {
                          optBg = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold";
                        } else if (isSelected && !isCorrectKey) {
                          optBg = "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200";
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${optBg}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {opt.key}
                            </span>
                            <div className="flex-1">
                              <MathText content={opt.text} />
                            </div>
                            {isCorrectKey && (
                              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">Correct Key</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Correct Answer: <strong className="text-slate-800 dark:text-slate-200">{q.correctAnswers.join(", ")}</strong>
                    {" • "}
                    Your Answer: <strong className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {userAns.length > 0 ? userAns.join(", ") : "None"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};