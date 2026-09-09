"use client";

import React, { memo } from "react";
import { Question } from "@/types/exam";
import { X } from "lucide-react";

interface QuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<number, string[]>;
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  onSelect: (index: number) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const QuestionPalette = memo(function QuestionPalette({
  questions,
  currentIndex,
  selectedAnswers,
  markedForReview,
  visited,
  onSelect,
  isOpenMobile = false,
  onCloseMobile,
}: QuestionPaletteProps) {
  const answeredCount = Object.values(selectedAnswers).filter((a) => a && a.length > 0).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  const content = (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="font-black text-slate-900 text-xs tracking-wider uppercase block">
            Question Palette
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {answeredCount} Answered • {markedCount} Marked
          </span>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close Palette"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grid of Palette Buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[50vh] lg:max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
        {questions.map((q, idx) => {
          const isAnswered = (selectedAnswers[q.id] || []).length > 0;
          const isMarked = markedForReview[q.id];
          const isCurrent = currentIndex === idx;

          let badgeStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent";
          if (isMarked) {
            badgeStyle = "bg-purple-600 text-white shadow-xs border-purple-600";
          } else if (isAnswered) {
            badgeStyle = "bg-emerald-600 text-white shadow-xs border-emerald-600";
          } else if (visited[idx]) {
            badgeStyle = "bg-rose-50 text-rose-600 border border-rose-200";
          }

          return (
            <button
              key={q.id}
              onClick={() => {
                onSelect(idx);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`h-10 w-full rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border ${badgeStyle} ${
                isCurrent
                  ? "ring-2 ring-blue-600 ring-offset-2 !bg-white !text-blue-600 !border-blue-600 font-black shadow-xs scale-105"
                  : "active:scale-95"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend Indicator */}
      <div className="border-t border-slate-100 pt-3.5 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium select-none">
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
    </div>
  );

  return (
    <>
      {/* Desktop View Sidebar */}
      <aside className="hidden lg:block w-80 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs h-fit select-none shrink-0 sticky top-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl z-10 max-h-[85vh] animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />
            {content}
          </div>
        </div>
      )}
    </>
  );
});