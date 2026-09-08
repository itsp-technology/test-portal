"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { ExamItem, ExamResult, Question } from "@/types/exam";
import { AVAILABLE_TESTS } from "@/data/exams";
import { parseMarkdownQuestions, shuffleQuestions } from "@/utils/markdownParser";
import { HomePage } from "@/components/HomePage";
import { CBTExamEngine } from "@/components/CBTExamEngine";
import { Scorecard } from "@/components/Scorecard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Loader2 } from "lucide-react";

export function ExamPortal() {
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("cbt_active_exam_id");
      return savedId ? AVAILABLE_TESTS.find((e) => e.id === savedId) || null : null;
    }
    return null;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("cbt_active_exam_id");
      if (savedId) {
        const cached = localStorage.getItem(`cbt_cached_q_${savedId}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            return [];
          }
        }
      }
    }
    return [];
  });

  const [activeScreen, setActiveScreen] = useState<"home" | "cbt" | "result">(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("cbt_active_exam_id");
      const cached = savedId ? localStorage.getItem(`cbt_cached_q_${savedId}`) : null;
      if (savedId && cached) return "cbt";
    }
    return "home";
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("cbt_active_exam_id");
      const cached = savedId ? localStorage.getItem(`cbt_cached_q_${savedId}`) : null;
      return Boolean(savedId && !cached);
    }
    return false;
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (!selectedExam || questions.length > 0) return;

    let isMounted = true;

    const fetchPaper = async () => {
      try {
        const res = await fetch(`/tests/${selectedExam.id}.md`);
        if (!res.ok) throw new Error("Could not reload test questions.");
        const text = await res.text();
        const parsed = parseMarkdownQuestions(text);

        if (isMounted && parsed.length > 0) {
          localStorage.setItem(`cbt_cached_q_${selectedExam.id}`, JSON.stringify(parsed));
          setQuestions(parsed);
          setActiveScreen("cbt");
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error restoring exam session.";
          setErrorMessage(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPaper();

    return () => {
      isMounted = false;
    };
  }, [selectedExam, questions.length]);

  const loadExamPaper = async (exam: ExamItem) => {
    setSelectedExam(exam);
    setLoading(true);
    setErrorMessage(null);

    localStorage.setItem("cbt_active_exam_id", exam.id);

    try {
      const res = await fetch(`/tests/${exam.id}.md`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            `The test paper "${exam.title}" has not been uploaded yet. Please select another mock test or check back soon.`
          );
        }
        throw new Error(`Unable to fetch question paper (HTTP code ${res.status}).`);
      }

      const markdownText = await res.text();
      const parsed = parseMarkdownQuestions(markdownText);

      if (!parsed || parsed.length === 0) {
        throw new Error("This question paper is empty or improperly structured.");
      }

      localStorage.setItem(`cbt_cached_q_${exam.id}`, JSON.stringify(parsed));
      setQuestions(parsed);
      setActiveScreen("cbt");
    } catch (err: unknown) {
      localStorage.removeItem("cbt_active_exam_id");
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading this exam paper.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    if (selectedExam) {
      localStorage.removeItem(`cbt_cached_q_${selectedExam.id}`);
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
  };

  const handleReattempt = () => {
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
  };

  const handleSubmitExam = (data: {
    selectedAnswers: Record<number, string[]>;
    natInputs: Record<number, string>;
  }) => {
    if (selectedExam) {
      localStorage.removeItem(`cbt_cached_q_${selectedExam.id}`);
    }
    localStorage.removeItem("cbt_active_exam_id");
    setUserAnswers(data.selectedAnswers);
    setActiveScreen("result");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const calculateResults = (): ExamResult => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center max-w-sm text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <h3 className="font-bold text-sm text-slate-800">Loading Test Paper...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Setting up your secure exam environment.
          </p>
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
        results={calculateResults()}
        questions={questions}
        selectedAnswers={userAnswers}
        onReattempt={handleReattempt}
        onReturnHome={handleBackToHome}
      />
    );
  }

  return <HomePage onSelectExam={loadExamPaper} />;
}