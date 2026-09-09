"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ExamItem, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { QuestionPalette } from "@/components/QuestionPalette";
import { ExamTimer } from "@/components/ExamTimer";
import { translateTextToHindi } from "@/utils/translate";
import {
  Send,
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  LayoutGrid,
  Languages,
  Loader2,
} from "lucide-react";

const MermaidRenderer = dynamic(
  () => import("@/components/MermaidRenderer").then((m) => m.MermaidRenderer),
  { ssr: false }
);

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
  const storageKey = `cbt_exam_state_${exam.id}`;

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(`${storageKey}_index`);
    return saved ? Number(saved) : 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  const [natInputs, setNatInputs] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_nat`);
    return saved ? JSON.parse(saved) : {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`${storageKey}_review`);
    return saved ? JSON.parse(saved) : {};
  });

  const [visited, setVisited] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return { 0: true };
    const saved = localStorage.getItem(`${storageKey}_visited`);
    return saved ? JSON.parse(saved) : { 0: true };
  });

  // Per-question Hindi translation state
  const [translatedMap, setTranslatedMap] = useState<
    Record<number, { prompt: string; options: { key: string; text: string }[] }>
  >({});
  const [activeQuestionLang, setActiveQuestionLang] = useState<Record<number, "en" | "hi">>({});
  const [translating, setTranslating] = useState<boolean>(false);

  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const answersRef = useRef({ selectedAnswers, natInputs });

  useEffect(() => {
    answersRef.current = { selectedAnswers, natInputs };
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`${storageKey}_index`, currentIndex.toString());
      localStorage.setItem(`${storageKey}_answers`, JSON.stringify(selectedAnswers));
      localStorage.setItem(`${storageKey}_nat`, JSON.stringify(natInputs));
      localStorage.setItem(`${storageKey}_review`, JSON.stringify(markedForReview));
      localStorage.setItem(`${storageKey}_visited`, JSON.stringify(visited));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, selectedAnswers, natInputs, markedForReview, visited, storageKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const clearSessionStorage = useCallback(() => {
    localStorage.removeItem(`${storageKey}_index`);
    localStorage.removeItem(`${storageKey}_answers`);
    localStorage.removeItem(`${storageKey}_nat`);
    localStorage.removeItem(`${storageKey}_review`);
    localStorage.removeItem(`${storageKey}_visited`);
    localStorage.removeItem(`${storageKey}_time`);
    localStorage.removeItem("cbt_active_exam_id");
  }, [storageKey]);

  const handleExitExam = () => {
    if (confirm("Are you sure you want to exit? Your exam progress will be cleared.")) {
      clearSessionStorage();
      onExit();
    }
  };

  const handleSubmitExam = useCallback(() => {
    clearSessionStorage();
    onSubmit(answersRef.current);
  }, [clearSessionStorage, onSubmit]);

  const handleSelectQuestionIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setVisited((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, []);

  const currentQ = questions[currentIndex];
  const isCurrentInHindi = currentQ ? activeQuestionLang[currentQ.id] === "hi" : false;

  // Toggle translation on-demand for the current question only
  const handleToggleCurrentQuestionLang = async () => {
    if (!currentQ) return;

    if (isCurrentInHindi) {
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "en" }));
      return;
    }

    if (translatedMap[currentQ.id]) {
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "hi" }));
      return;
    }

    setTranslating(true);
    try {
      const translatedPrompt = await translateTextToHindi(currentQ.prompt);
      const translatedOptions = await Promise.all(
        currentQ.options.map(async (opt) => ({
          key: opt.key,
          text: await translateTextToHindi(opt.text),
        }))
      );

      setTranslatedMap((prev) => ({
        ...prev,
        [currentQ.id]: {
          prompt: translatedPrompt,
          options: translatedOptions,
        },
      }));
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "hi" }));
    } finally {
      setTranslating(false);
    }
  };

  const handleOptionSelect = useCallback((key: string) => {
    if (!currentQ) return;
    if (currentQ.type === "MCQ") {
      setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: [key] }));
    } else if (currentQ.type === "MSQ") {
      setSelectedAnswers((prev) => {
        const current = prev[currentQ.id] || [];
        const next = current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key];
        return { ...prev, [currentQ.id]: next };
      });
    }
  }, [currentQ]);

  const handleNatChange = useCallback((val: string) => {
    if (!currentQ) return;
    setNatInputs((prev) => ({ ...prev, [currentQ.id]: val }));
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: val ? [val] : [] }));
  }, [currentQ]);

  const handleClearCurrent = () => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
    if (currentQ.type === "NAT") {
      setNatInputs((prev) => {
        const next = { ...prev };
        delete next[currentQ.id];
        return next;
      });
    }
  };

  const currentDisplayPrompt =
    isCurrentInHindi && translatedMap[currentQ?.id]?.prompt
      ? translatedMap[currentQ.id].prompt
      : currentQ?.prompt;

  const currentDisplayOptions =
    isCurrentInHindi && translatedMap[currentQ?.id]?.options
      ? translatedMap[currentQ.id].options
      : currentQ?.options || [];

  const answeredQuestionsCount = Object.values(selectedAnswers).filter(
    (a) => a && a.length > 0
  ).length;

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between pb-16 lg:pb-0"
    >
      {/* Top Fixed Header */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2 sm:gap-3 truncate pr-2">
          <button
            onClick={handleExitExam}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
            title="Exit Exam"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="truncate">
            <h2 className="font-black text-slate-900 text-xs sm:text-base tracking-tight leading-tight truncate">
              {exam.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
              Q {currentIndex + 1}/{questions.length} • Max Marks: {exam.maxMarks}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ExamTimer
            storageKey={storageKey}
            initialMinutes={exam.durationMins}
            onTimeUp={handleSubmitExam}
          />
          <button
            onClick={handleSubmitExam}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* Main Question View */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-6 gap-4 sm:gap-6">
        <section className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Question Header & On-Demand Language Toggle */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 sm:mb-5 gap-2 select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600">
                  Question {currentIndex + 1}
                </span>

                {currentQ?.type === "MCQ" && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    MCQ (Single Choice)
                  </span>
                )}
                {currentQ?.type === "MSQ" && (
                  <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    MSQ (Multiple Choice)
                  </span>
                )}
                {currentQ?.type === "NAT" && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    NAT (Numerical Value)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* On-Demand Per-Question Hindi Switch */}
                <button
                  type="button"
                  onClick={handleToggleCurrentQuestionLang}
                  disabled={translating}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                    isCurrentInHindi
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                  title="Translate this question"
                >
                  {translating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Languages className="w-3.5 h-3.5" />
                  )}
                  <span>{isCurrentInHindi ? "English" : "हिंदी"}</span>
                </button>

                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  +2 Marks • Negative {currentQ?.type === "MCQ" ? "-0.66" : "0"}
                </span>
              </div>
            </div>

            {currentQ?.type === "MSQ" && (
              <div className="mb-4 bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 text-[11px] text-purple-800 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                <span>One or more options can be correct. Click multiple checkboxes to select all valid choices.</span>
              </div>
            )}

            {/* Render Question Text */}
            <div className="text-sm sm:text-base leading-relaxed text-slate-800 space-y-3 font-normal">
              {currentDisplayPrompt && <MathText content={currentDisplayPrompt} />}
            </div>

            {currentQ?.mermaidChart && (
              <div className="my-4">
                <MermaidRenderer chart={currentQ.mermaidChart} />
              </div>
            )}

            {/* Render Options */}
            <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
              {currentQ && currentQ.type !== "NAT" ? (
                currentDisplayOptions.length > 0 ? (
                  currentDisplayOptions.map((opt) => {
                    const isChecked = (selectedAnswers[currentQ.id] || []).includes(opt.key);
                    const isMSQ = currentQ.type === "MSQ";

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleOptionSelect(opt.key)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm cursor-pointer ${
                          isChecked
                            ? isMSQ
                              ? "border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-xs ring-1 ring-purple-600/30"
                              : "border-blue-600 bg-blue-50/60 text-blue-950 font-bold shadow-xs ring-1 ring-blue-600/30"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="pt-0.5 sm:pt-0 shrink-0 select-none">
                          {isMSQ ? (
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-slate-300 bg-white hover:border-slate-400"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isChecked
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white hover:border-slate-400"
                              }`}
                            >
                              {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          )}
                        </div>

                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs shrink-0 select-none ${
                            isChecked
                              ? isMSQ
                                ? "bg-purple-600 text-white"
                                : "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {opt.key}
                        </div>

                        <div className="flex-1 leading-snug pt-0.5">
                          <MathText content={opt.text} />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-xs text-amber-600 italic">No options available.</div>
                )
              ) : (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl">
                  <label className="block text-xs font-bold text-slate-600 mb-2 select-none">
                    Enter Numerical Value (NAT):
                  </label>
                  <input
                    type="number"
                    value={natInputs[currentQ?.id || 0] || ""}
                    onChange={(e) => handleNatChange(e.target.value)}
                    placeholder="Type numerical answer..."
                    className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Footer Actions */}
          <div className="hidden lg:flex flex-wrap items-center justify-between border-t border-slate-100 pt-5 mt-6 gap-2 select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentQ) {
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [currentQ.id]: !prev[currentQ.id],
                    }));
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
                onClick={handleClearCurrent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Clear Response
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
                    setVisited((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
                  }
                }}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Question Palette Sidebar */}
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          selectedAnswers={selectedAnswers}
          markedForReview={markedForReview}
          visited={visited}
          onSelect={handleSelectQuestionIndex}
          isOpenMobile={isMobilePaletteOpen}
          onCloseMobile={() => setIsMobilePaletteOpen(false)}
        />
      </div>

      {/* Mobile Sticky Touch Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3 flex items-center justify-between gap-1.5 shadow-lg z-40 select-none">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 active:scale-95 transition"
          aria-label="Previous Question"
        >
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        </button>

        <button
          onClick={handleClearCurrent}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition"
          title="Clear"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (currentQ) {
              setMarkedForReview((prev) => ({
                ...prev,
                [currentQ.id]: !prev[currentQ.id],
              }));
            }
          }}
          className={`p-2 rounded-xl border transition ${
            currentQ && markedForReview[currentQ.id]
              ? "bg-purple-100 text-purple-700 border-purple-300"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          title="Mark for Review"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsMobilePaletteOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold active:scale-95 transition"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {currentIndex + 1}/{questions.length} ({answeredQuestionsCount})
          </span>
        </button>

        <button
          onClick={() => {
            if (currentIndex < questions.length - 1) {
              const next = currentIndex + 1;
              setCurrentIndex(next);
              setVisited((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
            }
          }}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 max-w-[140px] bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};