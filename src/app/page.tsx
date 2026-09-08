"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { ExamItem, ExamResult, Question } from "@/types/exam";
import { AVAILABLE_TESTS } from "@/data/exams";
import { parseMarkdownQuestions } from "@/utils/markdownParser";
import { HomePage } from "@/components/HomePage";
import { CBTExamEngine } from "@/components/CBTExamEngine";
import { Scorecard } from "@/components/Scorecard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Loader2 } from "lucide-react";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<"home" | "cbt" | "result">("home");
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});

  // Restore session if user refreshed the browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedExamId = localStorage.getItem("cbt_active_exam_id");
    if (!savedExamId) return;

    const matched = AVAILABLE_TESTS.find((e) => e.id === savedExamId);
    if (matched) {
      loadExamPaper(matched);
    }
  }, []);

  const loadExamPaper = async (exam: ExamItem) => {
    setSelectedExam(exam);
    setLoading(true);
    setErrorMessage(null);

    // Save active exam ID in storage for reload protection
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
    localStorage.removeItem("cbt_active_exam_id");
    setSelectedExam(null);
    setErrorMessage(null);
    setQuestions([]);
    setActiveScreen("home");
  };

  const handleSubmitExam = (data: {
    selectedAnswers: Record<number, string[]>;
    natInputs: Record<number, string>;
  }) => {
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

  if (activeScreen === "home") {
    return <HomePage onSelectExam={loadExamPaper} />;
  }

  if (activeScreen === "cbt" && selectedExam) {
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
        onReattempt={() => {
          if (selectedExam) loadExamPaper(selectedExam);
        }}
        onReturnHome={handleBackToHome}
      />
    );
  }

  return null;
}