// Persistent in-memory + local storage translation cache
const MEMORY_CACHE = new Map<string, string>();
const STORAGE_PREFIX = "cbt_trans_clean_v6_";

function hashKey(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Check if a segment is a math formula ($...$ or $$...$$)
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
  return /[a-zA-Z]{2,}/.test(text);
}

interface MyMemoryResponse {
  responseData?: {
    translatedText?: string;
  };
}

// 1. JSONP Helper with strict TypeScript types (bypasses CORS in Web & Android APK)
function fetchJsonp(url: string, timeoutMs = 3500): Promise<MyMemoryResponse | null> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);

    const callbackName = `jsonp_trans_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      Reflect.deleteProperty(window as unknown as Record<string, unknown>, callbackName);
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP Timeout"));
    }, timeoutMs);

    (window as unknown as Record<string, unknown>)[callbackName] = (data: MyMemoryResponse) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP Load Error"));
    };

    document.head.appendChild(script);
  });
}

// 2. Client-side Safe Translator (No server route required)
async function translatePlainPhrase(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || !hasTranslatableText(trimmed)) return text;

  const leadingSpace = text.match(/^\s*/)?.[0] || "";
  const trailingSpace = text.match(/\s*$/)?.[0] || "";

  const key = hashKey(trimmed);
  if (MEMORY_CACHE.has(key)) {
    return leadingSpace + MEMORY_CACHE.get(key)! + trailingSpace;
  }

  // Provider 1: Google Translate GTX Single Gateway
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2600);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as unknown;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: unknown[]) => (Array.isArray(item) ? String(item[0] || "") : ""))
          .join("");
        if (translated && translated.trim()) {
          MEMORY_CACHE.set(key, translated);
          return leadingSpace + translated + trailingSpace;
        }
      }
    }
  } catch {}

  // Provider 2: MyMemory JSONP Protocol (Works with zero CORS issues in APK WebViews)
  try {
    const jsonpUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=en|hi`;
    const data = await fetchJsonp(jsonpUrl, 3000);
    if (data?.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated && translated.trim()) {
        MEMORY_CACHE.set(key, translated);
        return leadingSpace + translated + trailingSpace;
      }
    }
  } catch {}

  // Provider 3: MyMemory Standard Fetch Fallback
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=en|hi`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as MyMemoryResponse;
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        MEMORY_CACHE.set(key, translated);
        return leadingSpace + translated + trailingSpace;
      }
    }
  } catch {}

  return text;
}

// 3. Segment Splicer: Preserves Math ($...$ and $$...$$) intact
export async function translateTextToHindi(rawText: string): Promise<string> {
  if (!rawText || !rawText.trim()) return rawText;

  if (isMathBlock(rawText) || !hasTranslatableText(rawText)) {
    return rawText;
  }

  const overallKey = hashKey(rawText);

  if (MEMORY_CACHE.has(overallKey)) {
    return MEMORY_CACHE.get(overallKey)!;
  }

  if (typeof window !== "undefined") {
    try {
      const disk = localStorage.getItem(`${STORAGE_PREFIX}${overallKey}`);
      if (disk) {
        MEMORY_CACHE.set(overallKey, disk);
        return disk;
      }
    } catch {}
  }

  // Split by KaTeX delimiters ($$...$$ or $...$) while keeping delimiters in the segments
  const segments = rawText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  const translatedSegments = await Promise.all(
    segments.map(async (seg) => {
      if (!seg) return "";
      if (isMathBlock(seg)) {
        return seg; // Math remains untouched
      }
      return await translatePlainPhrase(seg);
    })
  );

  const finalResult = translatedSegments.join("");

  MEMORY_CACHE.set(overallKey, finalResult);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${overallKey}`, finalResult);
    } catch {}
  }

  return finalResult;
}

// 4. Batch Concurrent Runner for Question + Options
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