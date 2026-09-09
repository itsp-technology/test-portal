// Fast In-Memory & LocalStorage Cache
const MEMORY_CACHE = new Map<string, string>();
const STORAGE_PREFIX = "cbt_trans_clean_v3_";

function hashKey(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Check if a segment is a math formula
function isMathBlock(text: string): boolean {
  const trimmed = text.trim();
  return (
    (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length >= 4) ||
    (trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length >= 2)
  );
}

// Check if text has English words that actually need translation
function hasTranslatableText(text: string): boolean {
  if (!text) return false;
  // If no math, does it have at least 2 consecutive alphabetic characters?
  return /[a-zA-Z]{2,}/.test(text);
}

// Network fetch with abort timeout
async function fetchWithTimeout(url: string, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Pure text translator (ONLY called on plain English phrases, NEVER on math)
async function translatePlainPhrase(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || !hasTranslatableText(trimmed)) return text;

  // Preserve leading/trailing spaces so sentence assembly is seamless
  const leadingSpace = text.match(/^\s*/)?.[0] || "";
  const trailingSpace = text.match(/\s*$/)?.[0] || "";

  // Check cache for this exact phrase
  const key = hashKey(trimmed);
  if (MEMORY_CACHE.has(key)) {
    return leadingSpace + MEMORY_CACHE.get(key)! + trailingSpace;
  }

  // Provider 1: Google Translate Single Gateway
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(url, 2200);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const result = data[0].map((item: unknown[]) => (Array.isArray(item) ? item[0] : "")).join("");
        if (result && result.trim()) {
          MEMORY_CACHE.set(key, result);
          return leadingSpace + result + trailingSpace;
        }
      }
    }
  } catch {}

  // Provider 2: Lingva Proxy Gateway (Fallback)
  try {
    const url = `https://lingva.ml/api/v1/en/hi/${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(url, 2500);
    if (res.ok) {
      const data = await res.json();
      if (data?.translation) {
        MEMORY_CACHE.set(key, data.translation);
        return leadingSpace + data.translation + trailingSpace;
      }
    }
  } catch {}

  // Provider 3: MyMemory Fallback
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|hi`;
    const res = await fetchWithTimeout(url, 2500);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const result = data.responseData.translatedText;
        MEMORY_CACHE.set(key, result);
        return leadingSpace + result + trailingSpace;
      }
    }
  } catch {}

  return text;
}

// Main Function: Splice, Translate English Segments, Re-stitch Exact Math
export async function translateTextToHindi(rawText: string): Promise<string> {
  if (!rawText || !rawText.trim()) return rawText;

  // Fast-path: Entire text is pure math (e.g. options like "$(A - B) \cup (B \cap A)$")
  if (isMathBlock(rawText) || !hasTranslatableText(rawText)) {
    return rawText;
  }

  const overallKey = hashKey(rawText);

  // Check memory cache
  if (MEMORY_CACHE.has(overallKey)) {
    return MEMORY_CACHE.get(overallKey)!;
  }

  // Check local storage
  if (typeof window !== "undefined") {
    try {
      const disk = localStorage.getItem(`${STORAGE_PREFIX}${overallKey}`);
      if (disk) {
        MEMORY_CACHE.set(overallKey, disk);
        return disk;
      }
    } catch {}
  }

  // Split text by KaTeX delimiters ($$...$$ or $...$) while keeping delimiters in the array
  const segments = rawText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  // Translate only the English segments in parallel
  const translatedSegments = await Promise.all(
    segments.map(async (seg) => {
      if (!seg) return "";
      // If it's a math expression, DO NOT TOUCH IT AT ALL
      if (isMathBlock(seg)) {
        return seg;
      }
      return await translatePlainPhrase(seg);
    })
  );

  const finalResult = translatedSegments.join("");

  // Store in cache
  MEMORY_CACHE.set(overallKey, finalResult);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${overallKey}`, finalResult);
    } catch {}
  }

  return finalResult;
}

// Question-Level Concurrent Runner
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