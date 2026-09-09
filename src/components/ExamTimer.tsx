"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ExamTimerProps {
  storageKey: string;
  initialMinutes: number;
  onTimeUp: () => void;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  storageKey,
  initialMinutes,
  onTimeUp,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (typeof window === "undefined") return initialMinutes * 60;
    const saved = localStorage.getItem(`${storageKey}_time`);
    return saved !== null ? parseInt(saved, 10) : initialMinutes * 60;
  });

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        localStorage.setItem(`${storageKey}_time`, next.toString());
        if (next <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, storageKey, onTimeUp]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 300; // Under 5 mins

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-xs select-none transition-colors ${
        isUrgent
          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 animate-pulse"
          : "bg-white dark:bg-[#161f33] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
      }`}
      title="Remaining Exam Time"
    >
      <Clock
        className={`w-3.5 h-3.5 shrink-0 ${
          isUrgent ? "text-rose-500 animate-spin" : "text-rose-500"
        }`}
      />
      <span>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
};