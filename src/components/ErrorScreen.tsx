"use client";

import React from "react";
import { FileQuestion, ArrowLeft, RotateCcw, AlertCircle } from "lucide-react";

interface ErrorScreenProps {
  title?: string;
  message: string;
  testTitle?: string;
  onBackToCatalog: () => void;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = "Question Paper Unavailable",
  message,
  testTitle,
  onBackToCatalog,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
          <FileQuestion className="w-7 h-7" />
        </div>

        {/* Header */}
        <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
          {title}
        </h2>

        {testTitle && (
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mt-1 px-2.5 py-0.5 bg-blue-50 rounded-md border border-blue-100">
            {testTitle}
          </p>
        )}

        {/* Message Container */}
        <div className="w-full mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mt-6 w-full">
          <button
            onClick={onBackToCatalog}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Mock Catalog
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-blue-600/20 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};