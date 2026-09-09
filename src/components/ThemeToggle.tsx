"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<{ variant?: "header" | "portal" }> = ({
  variant = "header",
}) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Read user preference from localStorage, default to light
    const saved = localStorage.getItem("portal_theme");
    const activeDark = saved === "dark";

    setIsDark(activeDark);
    const root = document.documentElement;

    // Clean up any old leftover classes from previous setups
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");

    if (activeDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const root = document.documentElement;
    const nextDark = !isDark;

    setIsDark(nextDark);

    if (nextDark) {
      root.classList.add("dark");
      localStorage.setItem("portal_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("portal_theme", "light");
    }
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