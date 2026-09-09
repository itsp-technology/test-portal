const translationCache = new Map<string, string>();

export async function translateTextToHindi(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  if (translationCache.has(text)) {
    return translationCache.get(text)!;
  }

  try {
    // Isolate LaTeX blocks: $$...$$ or $...$
    const placeholders: string[] = [];
    const sanitizedText = text.replace(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g, (match) => {
      placeholders.push(match);
      return `__MATH_${placeholders.length - 1}__`;
    });

    // Lightweight client translation endpoint (free, no auth required)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
      sanitizedText
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation failed");

    const data = await res.json();
    let translated = "";
    if (Array.isArray(data[0])) {
      translated = data[0].map((item: unknown[]) => item[0]).join("");
    }

    // Restore preserved LaTeX blocks
    const restoredText = translated.replace(/__MATH_(\d+)__/g, (_, idx) => {
      const index = parseInt(idx, 10);
      return placeholders[index] || "";
    });

    translationCache.set(text, restoredText);
    return restoredText;
  } catch {
    // Fallback gracefully to original text without breaking UI
    return text;
  }
}