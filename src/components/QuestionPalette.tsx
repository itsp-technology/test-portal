"use client";

import React, { memo } from "react";
import { Question } from "@/types/exam";

interface QuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<number, string[]>;
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  onSelect: (index: number) => void;
}

export const QuestionPalette = memo(function QuestionPalette({
  questions,
  currentIndex,
  selectedAnswers,
  markedForReview,
  visited,
  onSelect,
}: QuestionPaletteProps) {
  return (
    <aside className="w-full lg:w-80 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5 h-fit select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="font-black text-slate-900 text-xs tracking-wider uppercase">
          Question Palette
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {questions.length} Questions
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
        {questions.map((q, idx) => {
          const isAnswered = (selectedAnswers[q.id] || []).length > 0;
          const isMarked = markedForReview[q.id];
          const isCurrent = currentIndex === idx;

          let badgeStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200";
          if (isMarked) {
            badgeStyle = "bg-purple-600 text-white shadow-xs";
          } else if (isAnswered) {
            badgeStyle = "bg-emerald-600 text-white shadow-xs";
          } else if (visited[idx]) {
            badgeStyle = "bg-rose-50 text-rose-600 border border-rose-200";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`h-10 w-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${badgeStyle} ${
                isCurrent
                  ? "ring-2 ring-blue-600 ring-offset-2 !bg-white !text-blue-600 border border-blue-600 font-black shadow-xs scale-105"
                  : "active:scale-95"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-3.5 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-200 shrink-0" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-600 shrink-0" />
          <span>Marked Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 shrink-0" />
          <span>Not Visited</span>
        </div>
      </div>
    </aside>
  );
});