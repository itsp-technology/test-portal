"use client";

import React, { useMemo } from "react";
import katex from "katex";

export const MathText: React.FC<{ content: string; className?: string }> = ({
  content,
  className,
}) => {
  const renderedHTML = useMemo(() => {
    if (!content) return "";
    let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq, { displayMode: true, throwOnError: false });
      } catch {
        return eq;
      }
    });
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq, { displayMode: false, throwOnError: false });
      } catch {
        return eq;
      }
    });
    return processed.replace(/\n/g, "<br/>");
  }, [content]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: renderedHTML }} />;
};