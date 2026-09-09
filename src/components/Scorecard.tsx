"use client";

import React, { useState } from "react";
import { ExamItem, ExamResult, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { translateTextToHindi } from "@/utils/translate";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Languages,
  Loader2,
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
  const [showReview, setShowReview] = useState<boolean>(true);

  // Per-question language toggles and translations cache
  const [activeLangMap, setActiveLangMap] = useState<Record<number, "en" | "hi">>({});
  const [translatedMap, setTranslatedMap] = useState<
    Record<number, { prompt: string; options: { key: string; text: string }[] }>
  >({});
  const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({});
  const [globalTranslating, setGlobalTranslating] = useState<boolean>(false);

  // Translate a single question
  const handleToggleQuestionLang = async (q: Question) => {
    const currentLang = activeLangMap[q.id] || "en";

    if (currentLang === "hi") {
      setActiveLangMap((prev) => ({ ...prev, [q.id]: "en" }));
      return;
    }

    if (translatedMap[q.id]) {
      setActiveLangMap((prev) => ({ ...prev, [q.id]: "hi" }));
      return;
    }

    setLoadingQuestions((prev) => ({ ...prev, [q.id]: true }));
    try {
      const translatedPrompt = await translateTextToHindi(q.prompt);
      const translatedOptions = await Promise.all(
        q.options.map(async (opt) => ({
          key: opt.key,
          text: await translateTextToHindi(opt.text),
        }))
      );

      setTranslatedMap((prev) => ({
        ...prev,
        [q.id]: { prompt: translatedPrompt, options: translatedOptions },
      }));
      setActiveLangMap((prev) => ({ ...prev, [q.id]: "hi" }));
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  // Switch all solutions to Hindi or English at once
  const handleSwitchAllLanguage = async (targetLang: "en" | "hi") => {
    if (targetLang === "en") {
      const resetMap: Record<number, "en"> = {};
      questions.forEach((q) => {
        resetMap[q.id] = "en";
      });
      setActiveLangMap(resetMap);
      return;
    }

    setGlobalTranslating(true);
    try {
      const newTranslations: Record<
        number,
        { prompt: string; options: { key: string; text: string }[] }
      > = { ...translatedMap };

      await Promise.all(
        questions.map(async (q) => {
          if (!newTranslations[q.id]) {
            const promptHi = await translateTextToHindi(q.prompt);
            const optionsHi = await Promise.all(
              q.options.map(async (opt) => ({
                key: opt.key,
                text: await translateTextToHindi(opt.text),
              }))
            );
            newTranslations[q.id] = { prompt: promptHi, options: optionsHi };
          }
        })
      );

      setTranslatedMap(newTranslations);

      const allHindiMap: Record<number, "hi"> = {};
      questions.forEach((q) => {
        allHindiMap[q.id] = "hi";
      });
      setActiveLangMap(allHindiMap);
    } finally {
      setGlobalTranslating(false);
    }
  };

  const isAllHindi =
    questions.length > 0 &&
    questions.every((q) => activeLangMap[q.id] === "hi");

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-8 transition-colors duration-150">
      <main className="max-w-4xl w-full mx-auto space-y-6">
        {/* Navigation Bar */}
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

        {/* Hero Performance Card */}
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

          {/* Metric Stats */}
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

          {/* Action Buttons */}
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

        {/* Detailed Solutions Section */}
        {showReview && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Question Breakdown & Answer Key
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review your answers and verified correct solutions
                </p>
              </div>

              {/* Master English / Hindi Switch for All Solutions */}
              <div className="inline-flex items-center gap-2 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-semibold">
                  <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Solutions Language:</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchAllLanguage("en")}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                    !isAllHindi
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  disabled={globalTranslating}
                  onClick={() => handleSwitchAllLanguage("hi")}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    isAllHindi
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {globalTranslating && <Loader2 className="w-3 h-3 animate-spin text-white" />}
                  <span>हिंदी</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[q.id] || [];
              const isCorrect =
                userAns.length > 0 &&
                [...userAns].sort().join(",") === [...q.correctAnswers].sort().join(",");
              const isUnattempted = userAns.length === 0;

              const isHindi = activeLangMap[q.id] === "hi";
              const displayPrompt =
                isHindi && translatedMap[q.id]?.prompt
                  ? translatedMap[q.id].prompt
                  : q.prompt;

              const displayOptions =
                isHindi && translatedMap[q.id]?.options
                  ? translatedMap[q.id].options
                  : q.options;

              const isTranslatingCurrent = !!loadingQuestions[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-black uppercase">
                        Question {idx + 1} ({q.type})
                      </span>

                      {/* Per-Question Language Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleQuestionLang(q)}
                        disabled={isTranslatingCurrent}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          isHindi
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                        title="Translate this question"
                      >
                        {isTranslatingCurrent ? (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        ) : (
                          <Languages className="w-3 h-3" />
                        )}
                        <span>{isHindi ? "English" : "हिंदी"}</span>
                      </button>
                    </div>

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
                    <MathText content={displayPrompt} />
                  </div>

                  {displayOptions && displayOptions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {displayOptions.map((opt) => {
                        const isSelected = userAns.includes(opt.key);
                        const isCorrectKey = q.correctAnswers.includes(opt.key);

                        let optBg = "bg-slate-50 dark:bg-[#161f33] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                        if (isCorrectKey) {
                          optBg = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold";
                        } else if (isSelected && !isCorrectKey) {
                          optBg = "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200";
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-2xl border text-xs flex items-center gap-3 ${optBg}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {opt.key}
                            </span>
                            <div className="flex-1 leading-snug">
                              <MathText content={opt.text} />
                            </div>
                            {isCorrectKey && (
                              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800">
                    Correct Answer: <strong className="text-slate-800 dark:text-slate-200">{q.correctAnswers.join(", ")}</strong>
                    {" • "}
                    Your Answer: <strong className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : isUnattempted ? "text-slate-400" : "text-rose-600 dark:text-rose-400"}>
                      {userAns.length > 0 ? userAns.join(", ") : "Unattempted"}
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