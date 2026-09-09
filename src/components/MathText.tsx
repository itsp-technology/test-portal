"use client";

import React, { memo, useMemo } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";

interface MathTextProps {
  content: string;
  className?: string;
}

export const MathText = memo(function MathText({ content, className = "" }: MathTextProps) {
  const renderedParts = useMemo(() => {
    if (!content) return [];
    // Fast path: pure text without LaTeX formulas
    if (!content.includes("$")) {
      return [<span key="pure-text">{content}</span>];
    }

    // Split on $$display$$ first, then $inline$
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith("$$") && part.endsWith("$$")) {
        const formula = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          return (
            <span
              key={`math-disp-${index}`}
              className="my-1.5 block overflow-x-auto overflow-y-hidden"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const formula = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          return (
            <span
              key={`math-inl-${index}`}
              className="inline-block px-0.5 align-middle"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      return <span key={`txt-${index}`}>{part}</span>;
    });
  }, [content]);

  return <div className={`inline leading-relaxed ${className}`}>{renderedParts}</div>;
});