"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import { ExamItem, ExamResult, Question } from "@/types/exam";
import { AVAILABLE_TESTS } from "@/data/exams";
import { shuffleQuestions } from "@/utils/markdownParser";
import { getOrFetchExamQuestions, invalidateExamCache } from "@/utils/testCache";
import { HomePage } from "@/components/HomePage";
import { CBTExamEngine } from "@/components/CBTExamEngine";
import { Scorecard } from "@/components/Scorecard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Loader2 } from "lucide-react";

export function ExamPortal() {
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(() => {
    if (typeof window === "undefined") return null;
    const savedId = localStorage.getItem("cbt_active_exam_id");
    return savedId ? AVAILABLE_TESTS.find((e) => e.id === savedId) || null : null;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window === "undefined") return [];
    const savedId = localStorage.getItem("cbt_active_exam_id");
    if (!savedId) return [];
    const cached = localStorage.getItem(`cbt_cached_q_${savedId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeScreen, setActiveScreen] = useState<"home" | "cbt" | "result">(() => {
    if (typeof window === "undefined") return "home";
    const savedId = localStorage.getItem("cbt_active_exam_id");
    const cached = savedId ? localStorage.getItem(`cbt_cached_q_${savedId}`) : null;
    return savedId && cached ? "cbt" : "home";
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});

  // Background recovery only if ID exists without cached questions
  useEffect(() => {
    if (!selectedExam || questions.length > 0) return;

    let isMounted = true;
    getOrFetchExamQuestions(selectedExam.id)
      .then((data) => {
        if (isMounted && data.length > 0) {
          setQuestions(data);
          setActiveScreen("cbt");
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load exam paper.";
          setErrorMessage(msg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedExam, questions.length]);

  const loadExamPaper = useCallback(async (exam: ExamItem) => {
    setSelectedExam(exam);
    setErrorMessage(null);
    localStorage.setItem("cbt_active_exam_id", exam.id);

    // Fast memory & local read first (0ms latency path)
    try {
      const data = await getOrFetchExamQuestions(exam.id);
      setQuestions(data);
      setActiveScreen("cbt");
    } catch (err: unknown) {
      setLoading(true);
      try {
        const fallbackData = await getOrFetchExamQuestions(exam.id);
        setQuestions(fallbackData);
        setActiveScreen("cbt");
      } catch (finalErr: unknown) {
        localStorage.removeItem("cbt_active_exam_id");
        const message =
          finalErr instanceof Error ? finalErr.message : "Error loading exam paper.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const handleBackToHome = useCallback(() => {
    if (selectedExam) {
      invalidateExamCache(selectedExam.id);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_index`);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_answers`);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_nat`);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_review`);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_visited`);
      localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_time`);
    }
    localStorage.removeItem("cbt_active_exam_id");
    setSelectedExam(null);
    setErrorMessage(null);
    setQuestions([]);
    setActiveScreen("home");
  }, [selectedExam]);

  const handleReattempt = useCallback(() => {
    if (!selectedExam) return;

    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_index`);
    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_answers`);
    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_nat`);
    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_review`);
    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_visited`);
    localStorage.removeItem(`cbt_exam_state_${selectedExam.id}_time`);

    const reordered = shuffleQuestions(questions);
    localStorage.setItem(`cbt_cached_q_${selectedExam.id}`, JSON.stringify(reordered));

    setQuestions(reordered);
    setUserAnswers({});
    setActiveScreen("cbt");
  }, [selectedExam, questions]);

  const handleSubmitExam = useCallback((data: {
    selectedAnswers: Record<number, string[]>;
    natInputs: Record<number, string>;
  }) => {
    if (selectedExam) {
      localStorage.removeItem(`cbt_cached_q_${selectedExam.id}`);
    }
    localStorage.removeItem("cbt_active_exam_id");
    setUserAnswers(data.selectedAnswers);
    setActiveScreen("result");
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
  }, [selectedExam]);

  const results = useMemo((): ExamResult => {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id] || [];
      if (ans.length === 0) {
        unattemptedCount++;
      } else {
        const sortedAns = [...ans].sort().join(",");
        const sortedCorrect = [...q.correctAnswers].sort().join(",");
        if (sortedAns === sortedCorrect) {
          correctCount++;
          score += 2;
        } else {
          incorrectCount++;
          if (q.type === "MCQ") score -= 0.66;
        }
      }
    });

    const accuracy =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;

    return {
      score: Math.max(0, parseFloat(score.toFixed(2))),
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy,
    };
  }, [questions, userAnswers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center max-w-sm text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <h3 className="font-bold text-sm text-slate-800">Loading Exam Environment...</h3>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <ErrorScreen
        message={errorMessage}
        testTitle={selectedExam?.title}
        onBackToCatalog={handleBackToHome}
        onRetry={selectedExam ? () => loadExamPaper(selectedExam) : undefined}
      />
    );
  }

  if (activeScreen === "cbt" && selectedExam && questions.length > 0) {
    return (
      <CBTExamEngine
        exam={selectedExam}
        questions={questions}
        onExit={handleBackToHome}
        onSubmit={handleSubmitExam}
      />
    );
  }

  if (activeScreen === "result" && selectedExam) {
    return (
      <Scorecard
        exam={selectedExam}
        results={results}
        questions={questions}
        selectedAnswers={userAnswers}
        onReattempt={handleReattempt}
        onReturnHome={handleBackToHome}
      />
    );
  }

  return <HomePage onSelectExam={loadExamPaper} />;
}