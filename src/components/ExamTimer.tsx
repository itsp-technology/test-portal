"use client";

import React, { useState, useEffect, memo } from "react";
import { Clock } from "lucide-react";

interface ExamTimerProps {
  storageKey: string;
  initialMinutes: number;
  onTimeUp: () => void;
}

export const ExamTimer = memo(function ExamTimer({
  storageKey,
  initialMinutes,
  onTimeUp,
}: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${storageKey}_time`);
      if (saved !== null) {
        const val = Number(saved);
        return val > 0 ? val : initialMinutes * 60;
      }
    }
    return initialMinutes * 60;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        localStorage.setItem(`${storageKey}_time`, next.toString());
        if (next <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [storageKey, onTimeUp]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black shadow-inner select-none">
      <Clock className="w-4 h-4" />
      <span>{formatted}</span>
    </div>
  );
});