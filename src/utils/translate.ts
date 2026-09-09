// Persistent in-memory + local storage translation cache
const MEMORY_CACHE = new Map<string, string>();
const STORAGE_PREFIX = "trans_hi_v1_";

// Fast hash for cache keys
function hashKey(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// 1. Math Formula Masking: Protects KaTeX syntax ($...$) from being mangled
function maskMathFormulas(text: string): { maskedText: string; tokens: string[] } {
  const tokens: string[] = [];
  // Match display ($$..$$) or inline ($..$) math
  const maskedText = text.replace(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g, (match) => {
    const placeholder = `__MATH_${tokens.length}__`;
    tokens.push(match);
    return placeholder;
  });
  return { maskedText, tokens };
}

function unmaskMathFormulas(text: string, tokens: string[]): string {
  let unmasked = text;
  tokens.forEach((token, index) => {
    const placeholder = new RegExp(`__MATH_${index}__`, "g");
    unmasked = unmasked.replace(placeholder, token);
  });
  return unmasked;
}

// 2. Multi-Endpoint Fallback Engine (Google Cloud Translation Free Gateway & MyMemory)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestTranslation(query: string): Promise<string> {
  // Provider 1: Google Translate Single-Request Gateway (Fastest, ~120ms)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetchWithTimeout(url, { method: "GET" }, 3000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((item: unknown[]) => item[0]).join("");
      }
    }
  } catch {}

  // Provider 2: Lingva Proxy Gateway (Backup)
  try {
    const url = `https://lingva.ml/api/v1/en/hi/${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, { method: "GET" }, 3500);
    if (res.ok) {
      const data = await res.json();
      if (data && data.translation) {
        return data.translation;
      }
    }
  } catch {}

  // Provider 3: MyMemory Translation API (High-reliability fallback)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|hi`;
    const res = await fetchWithTimeout(url, { method: "GET" }, 3500);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch {}

  // If all external sources fail, return original query without breaking UI
  return query;
}

// 3. Main Translate Function with 0ms Cache Lookup & Formula Protection
export async function translateTextToHindi(rawText: string): Promise<string> {
  if (!rawText || !rawText.trim()) return rawText;

  const cacheKey = hashKey(rawText);

  // Check Layer 1: In-Memory RAM Cache (Instant 0ms)
  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey)!;
  }

  // Check Layer 2: Browser Storage Cache (Instant 0ms)
  if (typeof window !== "undefined") {
    try {
      const diskCached = localStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
      if (diskCached) {
        MEMORY_CACHE.set(cacheKey, diskCached);
        return diskCached;
      }
    } catch {}
  }

  // Step A: Mask formulas so the translation API only sees clean prose
  const { maskedText, tokens } = maskMathFormulas(rawText);

  // Step B: Fetch translated string
  const rawTranslated = await requestTranslation(maskedText);

  // Step C: Restore exact LaTeX formulas into original positions
  const finalResult = unmaskMathFormulas(rawTranslated, tokens);

  // Save to both caches
  MEMORY_CACHE.set(cacheKey, finalResult);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${cacheKey}`, finalResult);
    } catch {}
  }

  return finalResult;
}

// 4. Batch Parallel Translator: Translates prompt & all 4 options concurrently
export async function translateQuestionFull(q: {
  prompt: string;
  options: { key: string; text: string }[];
}): Promise<{ prompt: string; options: { key: string; text: string }[] }> {
  const [translatedPrompt, ...translatedOptions] = await Promise.all([
    translateTextToHindi(q.prompt),
    ...q.options.map((opt) => translateTextToHindi(opt.text)),
  ]);

  return {
    prompt: translatedPrompt,
    options: q.options.map((opt, i) => ({
      key: opt.key,
      text: translatedOptions[i] || opt.text,
    })),
  };
}