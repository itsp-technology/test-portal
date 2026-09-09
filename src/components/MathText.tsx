"use client";

import React, { memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  content: string;
}

export const MathText = memo(function MathText({ content }: MathTextProps) {
  if (!content) return null;

  // Split by $$display$$ and $inline$
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="block my-2" />;
          } catch {
            return <code key={index}>{part}</code>;
          }
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-0.5" />;
          } catch {
            return <code key={index}>{part}</code>;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
});