"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "sepia";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cbt_portal_theme") as ThemeMode;
      return saved || "light";
    }
    return "light";
  });

  const applyThemeToDOM = (selectedTheme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");
    root.classList.add(`theme-${selectedTheme}`);

    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("cbt_portal_theme", newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const sequence: ThemeMode[] = ["light", "dark", "sepia"];
    const nextIndex = (sequence.indexOf(theme) + 1) % sequence.length;
    setTheme(sequence[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}