"use client";

import React from "react";
import { ExamItem, Question, ExamResult } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { RotateCcw, ArrowLeft } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Attempt Scorecard
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{exam.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReattempt}
              className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-attempt
            </button>
            <button
              onClick={onReturnHome}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Score (Max {exam.maxMarks})
            </span>
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

        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">
            Question-by-Question Solution Breakdown
          </h3>
          {questions.map((q) => {
            const userAns = selectedAnswers[q.id] || [];
            const isCorrect =
              [...userAns].sort().join(",") === [...q.correctAnswers].sort().join(",");
            const isAttempted = userAns.length > 0;

            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Q{q.id} ({q.type})
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
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
                <div className="text-slate-800">
                  <MathText content={q.prompt} />
                </div>
                <div className="text-[11px] pt-2 border-t border-slate-100 text-slate-600 flex gap-4">
                  <span>
                    Your: <strong className="text-slate-900">{userAns.join(", ") || "None"}</strong>
                  </span>
                  <span>
                    Correct: <strong className="text-emerald-700">{q.correctAnswers.join(", ")}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};