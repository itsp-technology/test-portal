"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

export const MermaidRenderer: React.FC<{ chart: string }> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: "neutral" });
      mermaid.run({ nodes: [containerRef.current] });
    }
  }, [chart]);

  return (
    <div className="my-4 p-4 bg-white border border-slate-200 rounded-2xl flex justify-center shadow-inner overflow-x-auto">
      <div ref={containerRef} className="mermaid">
        {chart}
      </div>
    </div>
  );
};