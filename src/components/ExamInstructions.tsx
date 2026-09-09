"use client";

import React, { useState } from "react";
import { ExamItem } from "@/types/exam";
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  CheckSquare,
  ArrowLeft,
  Play,
  FileText,
  ShieldCheck,
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
              General Instructions
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold truncate max-w-xs sm:max-w-md">
              {exam.title}
            </p>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
          {exam.category} CBT
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Test Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duration</p>
            <p className="text-base font-black text-slate-900">{exam.durationMins} Mins</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
            <HelpCircle className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Questions</p>
            <p className="text-base font-black text-slate-900">{exam.totalQuestions}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Marks</p>
            <p className="text-base font-black text-slate-900">{exam.maxMarks}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
            <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Negative Mark</p>
            <p className="text-base font-black text-rose-600">-0.66 (MCQ)</p>
          </div>
        </div>

        {/* Instructions Body Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-black text-slate-900 text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Please Read the Following Instructions Carefully</span>
          </div>

          <div className="space-y-4">
            <section className="space-y-2">
              <h2 className="font-black text-slate-900 text-xs sm:text-sm">1. General Guidelines:</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Total duration of the examination is <strong>{exam.durationMins} minutes</strong>.</li>
                <li>The countdown timer at the top right displays the remaining time. When the timer reaches zero, the test will <strong>automatically submit</strong>.</li>
                <li>Do not close or reload the browser window during the test. Your answers are automatically saved securely.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-black text-slate-900 text-xs sm:text-sm">2. Question Types & Marking Scheme:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-blue-700 text-xs block">MCQ (Multiple Choice)</span>
                  <p className="text-[11px] text-slate-500">Only <strong>ONE</strong> option is correct. Uses circular radio buttons. Negative mark: <strong>-0.66</strong>.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-purple-700 text-xs block">MSQ (Multiple Select)</span>
                  <p className="text-[11px] text-slate-500">One or <strong>MORE</strong> options may be correct. Uses square checkboxes. No partial marks, <strong>0 negative marks</strong>.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <span className="font-extrabold text-amber-700 text-xs block">NAT (Numerical Answer)</span>
                  <p className="text-[11px] text-slate-500">Enter exact numerical value into the field. <strong>0 negative marks</strong>.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-black text-slate-900 text-xs sm:text-sm">3. Navigating & Palette Status:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold pt-1">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                  <span className="text-[11px] text-slate-600">Not Visited</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="w-3 h-3 rounded-full bg-rose-300 shrink-0" />
                  <span className="text-[11px] text-rose-700">Unanswered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-[11px] text-emerald-700">Answered</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                  <span className="text-[11px] text-purple-700">Marked Review</span>
                </div>
              </div>
            </section>
          </div>

          {/* Declaration Checkbox */}
          <div className="border-t border-slate-100 pt-5">
            <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 hover:bg-blue-50 transition">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium">
                I have read, understood and agree to all the above instructions. I confirm that I am ready to begin this examination.
              </span>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
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