"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<{ variant?: "header" | "portal" }> = ({
  variant = "header",
}) => {
  // Lazy initialization: reads localStorage once on mount without triggering cascading renders
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portal_theme");
      return saved === "dark";
    }
    return false;
  });

  // Track hydration state safely via an event tick or state initializer
  const [mounted, setMounted] = useState<boolean>(() => typeof window !== "undefined");

  // Keep DOM classes in sync with isDark state (Pure side-effect, zero setState calls inside)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("portal_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("portal_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDark((prev) => !prev);
  };

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />;
  }

  if (variant === "portal") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 active:scale-95 notranslate"
        title={isDark ? "Switch to White Theme" : "Switch to Dark Theme"}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/15 shadow-xs active:scale-95 notranslate"
      title={isDark ? "Switch to White Theme" : "Switch to Dark Theme"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-200" />
      )}
    </button>
  );
};