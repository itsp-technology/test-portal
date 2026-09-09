"use client";

import React, { useState } from "react";
import { ExamItem } from "@/types/exam";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  ArrowLeft,
  Play,
  FileText,
} from "lucide-react";

interface ExamInstructionsProps {
  exam: ExamItem;
  onBack: () => void;
  onStartExam: () => void;
}

export const ExamInstructions: React.FC<ExamInstructionsProps> = ({
  exam,
  onBack,
  onStartExam,
}) => {
  const [agreed, setAgreed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-150">
      {/* Top Header */}
      <header className="bg-white dark:bg-[#111726] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight leading-tight">
              General Instructions
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-xs sm:max-w-md">
              {exam.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle variant="portal" />
          <span className="text-xs font-black px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg">
            {exam.category} CBT
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Test Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs text-center">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Duration</p>
            <p className="text-base font-black text-slate-900 dark:text-slate-100">{exam.durationMins} Mins</p>
          </div>
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs text-center">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Questions</p>
            <p className="text-base font-black text-slate-900 dark:text-slate-100">{exam.totalQuestions}</p>
          </div>
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs text-center">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Marks</p>
            <p className="text-base font-black text-slate-900 dark:text-slate-100">{exam.maxMarks}</p>
          </div>
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs text-center">
            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Negative Mark</p>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">-0.66 (MCQ)</p>
          </div>
        </div>

        {/* Detailed Instructions Body Card */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Please Read the Following Instructions Carefully</span>
          </div>

          <div className="space-y-4">
            <section className="space-y-2">
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">1. General Guidelines:</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
                <li>Total duration of the examination is <strong>{exam.durationMins} minutes</strong>.</li>
                <li>The countdown timer at the top right displays the remaining time. When the timer reaches zero, the test will <strong>automatically submit</strong>.</li>
                <li>You can translate any individual question to <strong>हिंदी</strong> at any time using the language toggle on the question card.</li>
                <li>Do not close or reload the browser window during the test. Your answers are automatically saved securely.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">2. Question Types & Marking Scheme:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-blue-700 dark:text-blue-400 text-xs block">MCQ (Multiple Choice)</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Only <strong>ONE</strong> option is correct. Uses circular radio buttons. Negative mark: <strong>-0.66</strong>.</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-purple-700 dark:text-purple-400 text-xs block">MSQ (Multiple Select)</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">One or <strong>MORE</strong> options may be correct. Uses square checkboxes. No partial marks, <strong>0 negative marks</strong>.</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs block">NAT (Numerical Answer)</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Enter exact numerical value into the field. <strong>0 negative marks</strong>.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">3. Navigating & Palette Status:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold pt-1">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Not Visited</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                  <span className="w-3 h-3 rounded-full bg-rose-300 dark:bg-rose-500 shrink-0" />
                  <span className="text-[11px] text-rose-700 dark:text-rose-400">Unanswered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Answered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
                  <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                  <span className="text-[11px] text-purple-700 dark:text-purple-400">Marked Review</span>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I have read, understood and agree to all the above instructions. I confirm that I am ready to begin this examination.
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onStartExam}
            disabled={!agreed}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>I am Ready to Begin</span>
          </button>
        </div>
      </main>
    </div>
  );
};