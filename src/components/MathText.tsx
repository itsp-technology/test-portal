"use client";

import React, { memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  content: string;
}

// Lightweight Markdown parser for non-math text fragments
function renderFormattedMarkdown(text: string): React.ReactNode[] {
  // Tokenize bold (**text**), italic (*text* or _text_), code (`text`), and linebreaks (\n)
  const tokens = text.split(/(\*\*[^\*]+?\*\*|\*[^\*]+?\*|`[^`]+?`|\n)/g);

  return tokens.map((token, i) => {
    if (!token) return null;

    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={i} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="notranslate px-1.5 py-0.5 rounded bg-slate-100 text-rose-600 font-mono text-[12px] border border-slate-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token === "\n") {
      return <br key={i} />;
    }

    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
}

export const MathText = memo(function MathText({ content }: MathTextProps) {
  if (!content) return null;

  // Split by $$display$$ and $inline$ LaTeX math delimiters
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="notranslate block my-2"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="notranslate text-rose-500">
                {part}
              </code>
            );
          }
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="notranslate inline-block px-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="notranslate text-rose-500">
                {part}
              </code>
            );
          }
        }

        // Parse standard markdown inside ordinary text blocks
        return (
          <React.Fragment key={index}>
            {renderFormattedMarkdown(part)}
          </React.Fragment>
        );
      })}
    </span>
  );
});