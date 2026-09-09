"use client";

import React from "react";
import { AlertCircle, ArrowLeft, RotateCcw, FileQuestion } from "lucide-react";

interface ErrorScreenProps {
  message: string;
  testTitle?: string;
  onBackToCatalog: () => void;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message,
  testTitle,
  onBackToCatalog,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 select-none transition-colors duration-150">
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            Question Paper Unavailable
          </h2>
          {testTitle && (
            <span className="inline-block mt-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-[11px] font-bold text-blue-700 dark:text-blue-300 truncate max-w-xs sm:max-w-sm">
              {testTitle}
            </span>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 text-left flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed break-words">{message}</p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            onClick={onBackToCatalog}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mock Catalog</span>
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-black text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};