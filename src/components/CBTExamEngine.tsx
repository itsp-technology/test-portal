"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ExamItem, Question } from "@/types/exam";
import { MathText } from "@/components/MathText";
import { QuestionPalette } from "@/components/QuestionPalette";
import { ExamTimer } from "@/components/ExamTimer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  Menu,
  X,
  LogOut,
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

  // 1. Hydrate Initial State once
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(`${storageKey}_index`)) || 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`${storageKey}_answers`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [natInputs, setNatInputs] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`${storageKey}_nat`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`${storageKey}_review`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [visited, setVisited] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return { 0: true };
    try {
      const saved = localStorage.getItem(`${storageKey}_visited`);
      return saved ? JSON.parse(saved) : { 0: true };
    } catch {
      return { 0: true };
    }
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "exit" | "submit" | "reload";
  }>({
    isOpen: false,
    type: "exit",
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);

  // Translation States
  const [translatedMap, setTranslatedMap] = useState<
    Record<number, { prompt: string; options: { key: string; text: string }[] }>
  >({});
  const [activeQuestionLang, setActiveQuestionLang] = useState<Record<number, "en" | "hi">>({});
  const [translating, setTranslating] = useState<boolean>(false);

  // 2. Batched Storage Sync to prevent UI thread blocking
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef({ selectedAnswers, natInputs });

  useEffect(() => {
    answersRef.current = { selectedAnswers, natInputs };

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`${storageKey}_index`, currentIndex.toString());
        localStorage.setItem(`${storageKey}_answers`, JSON.stringify(selectedAnswers));
        localStorage.setItem(`${storageKey}_nat`, JSON.stringify(natInputs));
        localStorage.setItem(`${storageKey}_review`, JSON.stringify(markedForReview));
        localStorage.setItem(`${storageKey}_visited`, JSON.stringify(visited));
      } catch {}
    }, 120);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [currentIndex, selectedAnswers, natInputs, markedForReview, visited, storageKey]);

  // Back Navigation Trap
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setModalState({ isOpen: true, type: "reload" });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
        e.preventDefault();
        setModalState({ isOpen: true, type: "reload" });
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Parallel Full Question Translation
  const translateEntireQuestion = useCallback(async (q: Question) => {
    const promptPromise = translateTextToHindi(q.prompt);
    const optionsPromises = q.options && q.options.length > 0
      ? Promise.all(
          q.options.map(async (opt) => ({
            key: opt.key,
            text: await translateTextToHindi(opt.text),
          }))
        )
      : Promise.resolve([]);

    const [prompt, options] = await Promise.all([promptPromise, optionsPromises]);
    return { prompt, options };
  }, []);

  // Non-Blocking Predictive Background Prefetch
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const indicesToPrefetch = [currentIndex, currentIndex + 1, currentIndex + 2].filter(
      (idx) => idx < questions.length && !translatedMap[questions[idx]?.id]
    );

    if (indicesToPrefetch.length === 0) return;

    let isSubscribed = true;

    const runIdlePrefetch = () => {
      indicesToPrefetch.forEach((idx) => {
        const targetQ = questions[idx];
        if (!targetQ) return;

        translateEntireQuestion(targetQ)
          .then((res) => {
            if (isSubscribed) {
              setTranslatedMap((prev) => {
                if (prev[targetQ.id]) return prev;
                return { ...prev, [targetQ.id]: res };
              });
            }
          })
          .catch(() => {});
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
        runIdlePrefetch
      );
      return () => {
        isSubscribed = false;
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        }
      };
    } else {
      const timer = setTimeout(runIdlePrefetch, 250);
      return () => {
        isSubscribed = false;
        clearTimeout(timer);
      };
    }
  }, [currentIndex, questions, translatedMap, translateEntireQuestion]);

  const clearSessionStorage = useCallback(() => {
    try {
      localStorage.removeItem(`${storageKey}_index`);
      localStorage.removeItem(`${storageKey}_answers`);
      localStorage.removeItem(`${storageKey}_nat`);
      localStorage.removeItem(`${storageKey}_review`);
      localStorage.removeItem(`${storageKey}_visited`);
      localStorage.removeItem(`${storageKey}_time`);
      localStorage.removeItem("cbt_active_exam_id");
    } catch {}
  }, [storageKey]);

  const handleConfirmExit = useCallback(() => {
    clearSessionStorage();
    setModalState({ isOpen: false, type: "exit" });
    onExit();
  }, [clearSessionStorage, onExit]);

  const handleConfirmSubmit = useCallback(() => {
    clearSessionStorage();
    setModalState({ isOpen: false, type: "submit" });
    onSubmit(answersRef.current);
  }, [clearSessionStorage, onSubmit]);

  const handleConfirmReload = () => {
    setModalState({ isOpen: false, type: "reload" });
    window.location.reload();
  };

  const handleSelectQuestionIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setVisited((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, []);

  const currentQ = questions[currentIndex];
  const isCurrentInHindi = currentQ ? activeQuestionLang[currentQ.id] === "hi" : false;

  // Instant 0ms Language Switcher
  const handleToggleCurrentQuestionLang = async () => {
    if (!currentQ) return;

    if (isCurrentInHindi) {
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "en" }));
      return;
    }

    // Fast-path: already in memory
    if (translatedMap[currentQ.id]) {
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "hi" }));
      return;
    }

    // On-demand fallback
    setTranslating(true);
    try {
      const fullTranslation = await translateEntireQuestion(currentQ);
      setTranslatedMap((prev) => ({ ...prev, [currentQ.id]: fullTranslation }));
      setActiveQuestionLang((prev) => ({ ...prev, [currentQ.id]: "hi" }));
    } finally {
      setTranslating(false);
    }
  };

  // Instant O(1) Option Select
  const handleOptionSelect = useCallback(
    (key: string) => {
      if (!currentQ) return;
      const qId = currentQ.id;

      if (currentQ.type === "MCQ") {
        setSelectedAnswers((prev) => ({ ...prev, [qId]: [key] }));
      } else if (currentQ.type === "MSQ") {
        setSelectedAnswers((prev) => {
          const current = prev[qId] || [];
          const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
          return { ...prev, [qId]: next };
        });
      }
    },
    [currentQ]
  );

  const handleNatChange = useCallback(
    (val: string) => {
      if (!currentQ) return;
      const qId = currentQ.id;
      setNatInputs((prev) => ({ ...prev, [qId]: val }));
      setSelectedAnswers((prev) => ({ ...prev, [qId]: val ? [val] : [] }));
    },
    [currentQ]
  );

  const handleClearCurrent = useCallback(() => {
    if (!currentQ) return;
    const qId = currentQ.id;
    setSelectedAnswers((prev) => {
      if (!prev[qId]) return prev;
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    if (currentQ.type === "NAT") {
      setNatInputs((prev) => {
        if (!prev[qId]) return prev;
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  }, [currentQ]);

  const currentDisplayPrompt =
    isCurrentInHindi && translatedMap[currentQ?.id]?.prompt
      ? translatedMap[currentQ.id].prompt
      : currentQ?.prompt;

  const currentDisplayOptions =
    isCurrentInHindi && translatedMap[currentQ?.id]?.options
      ? translatedMap[currentQ.id].options
      : currentQ?.options || [];

  const answeredQuestionsCount = useMemo(() => {
    let count = 0;
    for (const key in selectedAnswers) {
      if (selectedAnswers[key]?.length > 0) count++;
    }
    return count;
  }, [selectedAnswers]);

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fafc] dark:bg-[#070b13] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 lg:pb-0 transition-colors duration-100"
    >
      {/* Top Sticky Header */}
      <header className="bg-white dark:bg-[#0d1424] border-b border-slate-200 dark:border-slate-800/90 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2 sm:gap-3 truncate pr-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
            aria-label="Open Exam Controls"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setModalState({ isOpen: true, type: "exit" })}
            className="hidden lg:flex p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="truncate">
            <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-base tracking-tight leading-tight truncate">
              {exam.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
              Q {currentIndex + 1}/{questions.length} • Max Marks: {exam.maxMarks}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle variant="portal" />
          </div>

          <ExamTimer
            storageKey={storageKey}
            initialMinutes={exam.durationMins}
            onTimeUp={handleConfirmSubmit}
          />

          <button
            type="button"
            onClick={() => setModalState({ isOpen: true, type: "submit" })}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
            title="Submit Exam"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-6 gap-4 sm:gap-6">
        <section className="flex-1 bg-white dark:bg-[#0e1628] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Question Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4 sm:mb-5 gap-2 select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Question {currentIndex + 1}
                </span>

                {currentQ?.type === "MCQ" && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    MCQ (Single)
                  </span>
                )}
                {currentQ?.type === "MSQ" && (
                  <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    MSQ (Multiple)
                  </span>
                )}
                {currentQ?.type === "NAT" && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    NAT (Numeric)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleCurrentQuestionLang}
                  disabled={translating}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                    isCurrentInHindi
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-[#162035] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1c2944]"
                  }`}
                  title="Translate question"
                >
                  {translating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Languages className="w-3.5 h-3.5" />
                  )}
                  <span>{isCurrentInHindi ? "English" : "हिंदी"}</span>
                </button>

                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#162035] px-2.5 py-1 rounded-lg">
                  +2 • {currentQ?.type === "MCQ" ? "-0.66" : "0"}
                </span>
              </div>
            </div>

            {/* MSQ Notice Banner */}
            {currentQ?.type === "MSQ" && (
              <div className="mb-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-xl p-3 text-xs text-purple-900 dark:text-purple-300 font-semibold flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-xs" />
                <span>One or more options can be correct. Click checkboxes to select all valid choices.</span>
              </div>
            )}

            {/* Question Prompt with Math Rendering */}
            <div className="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 space-y-3 font-normal">
              {currentDisplayPrompt && <MathText content={currentDisplayPrompt} />}
            </div>

            {currentQ?.mermaidChart && (
              <div className="my-4">
                <MermaidRenderer chart={currentQ.mermaidChart} />
              </div>
            )}

            {/* Options List */}
            <div className="mt-6 space-y-3">
              {currentQ && (currentQ.type === "MCQ" || currentQ.type === "MSQ" || currentDisplayOptions.length > 0) ? (
                currentDisplayOptions.length > 0 ? (
                  currentDisplayOptions.map((opt) => {
                    const isChecked = (selectedAnswers[currentQ.id] || []).includes(opt.key);
                    const isMSQ = currentQ.type === "MSQ";

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleOptionSelect(opt.key)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start sm:items-center gap-3.5 sm:gap-4 text-xs sm:text-sm cursor-pointer outline-none focus:outline-none ${
                          isChecked
                            ? isMSQ
                              ? "border-purple-500 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 text-purple-950 dark:text-purple-100 font-semibold shadow-xs ring-2 ring-purple-500/40"
                              : "border-blue-500 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-semibold shadow-xs ring-2 ring-blue-500/40"
                            : "border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-[#162035] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100/90 dark:hover:bg-[#1e2c48] text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="pt-0.5 sm:pt-0 shrink-0 select-none">
                          {isMSQ ? (
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-slate-300 dark:border-slate-500 bg-white dark:bg-[#0e1628]"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isChecked
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 dark:border-slate-500 bg-white dark:bg-[#0e1628]"
                              }`}
                            >
                              {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          )}
                        </div>

                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 select-none transition-all ${
                            isChecked
                              ? isMSQ
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {opt.key}
                        </div>

                        <div className="flex-1 leading-relaxed pt-0.5 font-medium">
                          <MathText content={opt.text} />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-semibold">
                    No options found for this question.
                  </div>
                )
              ) : (
                <div className="p-5 bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 select-none">
                    Enter Numerical Value (NAT):
                  </label>
                  <input
                    type="number"
                    value={natInputs[currentQ?.id || 0] || ""}
                    onChange={(e) => handleNatChange(e.target.value)}
                    placeholder="Type numerical answer..."
                    className="w-full max-w-xs px-4 py-2.5 bg-white dark:bg-[#0e1628] border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Footer Controls */}
          <div className="hidden lg:flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 mt-6 gap-2 select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
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
                    ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                    : "bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1e2c48]"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {currentQ && markedForReview[currentQ.id] ? "Marked" : "Mark Review"}
              </button>
              <button
                type="button"
                onClick={handleClearCurrent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1e2c48] transition cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#162035] transition cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    const next = currentIndex + 1;
                    setCurrentIndex(next);
                    setVisited((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
                  }
                }}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Desktop Palette */}
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0d1424]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 px-3 flex items-center justify-between gap-1.5 shadow-lg z-40 select-none">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </button>

        <button
          type="button"
          onClick={handleClearCurrent}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
          title="Clear"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
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
              ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          title="Mark for Review"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsMobilePaletteOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-800 dark:text-slate-200 text-xs font-bold active:scale-95 transition"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>
            {currentIndex + 1}/{questions.length} ({answeredQuestionsCount})
          </span>
        </button>

        <button
          type="button"
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

      {/* Slide-out Hamburger Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0e1628] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-150 select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Exam Controls
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[170px]">
                    {exam.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Theme Mode
                  </span>
                  <ThemeToggle variant="portal" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMobilePaletteOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Question Palette</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                    {answeredQuestionsCount}/{questions.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setModalState({ isOpen: true, type: "exit" });
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={
          modalState.type === "exit"
            ? "Are you sure you want to leave the exam?"
            : modalState.type === "reload"
            ? "Reload this examination session?"
            : "Ready to submit your test paper?"
        }
        message={
          modalState.type === "exit"
            ? "Dear candidate, leaving now will end your active test attempt and return you to the home catalog."
            : modalState.type === "reload"
            ? "Dear candidate, your responses and remaining test time are saved automatically. Reloading during an ongoing examination is not advised, but your progress will remain intact if you proceed."
            : `You have answered ${answeredQuestionsCount} out of ${questions.length} questions. Are you sure you wish to conclude your attempt and view your scorecard?`
        }
        confirmText={
          modalState.type === "exit"
            ? "Yes, Exit Exam"
            : modalState.type === "reload"
            ? "Reload Anyway"
            : "Yes, Submit Test"
        }
        cancelText={
          modalState.type === "reload"
            ? "Continue Exam"
            : modalState.type === "exit"
            ? "Stay in Exam"
            : "Review Answers"
        }
        onConfirm={
          modalState.type === "exit"
            ? handleConfirmExit
            : modalState.type === "reload"
            ? handleConfirmReload
            : handleConfirmSubmit
        }
        onCancel={() => setModalState({ isOpen: false, type: "exit" })}
      />
    </div>
  );
};