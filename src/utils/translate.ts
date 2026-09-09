// Persistent in-memory + local storage translation cache
const MEMORY_CACHE = new Map<string, string>();
const STORAGE_PREFIX = "cbt_trans_clean_v5_";

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

// 1. JSONP Request Helper (Bypasses CORS completely in both web and Android WebViews)
function fetchJsonp(url: string, timeoutMs = 3500): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);

    const callbackName = `jsonp_trans_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      delete (window as any)[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP Timeout"));
    }, timeoutMs);

    (window as any)[callbackName] = (data: any) => {
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

// 2. Multi-Provider Translator (Zero CORS errors)
async function translatePlainPhrase(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || !hasTranslatableText(trimmed)) return text;

  const leadingSpace = text.match(/^\s*/)?.[0] || "";
  const trailingSpace = text.match(/\s*$/)?.[0] || "";

  const key = hashKey(trimmed);
  if (MEMORY_CACHE.has(key)) {
    return leadingSpace + MEMORY_CACHE.get(key)! + trailingSpace;
  }

  // Provider 1: Google Translate Single GTX Gateway (Native CORS-Friendly Fetch)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2800);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: unknown[]) => (Array.isArray(item) ? item[0] : ""))
          .join("");
        if (translated && translated.trim()) {
          MEMORY_CACHE.set(key, translated);
          return leadingSpace + translated + trailingSpace;
        }
      }
    }
  } catch {}

  // Provider 2: MyMemory JSONP Protocol (Completely immune to CORS & 403 blocks)
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
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        MEMORY_CACHE.set(key, translated);
        return leadingSpace + translated + trailingSpace;
      }
    }
  } catch {}

  return text;
}

// 3. Segment Splicer: Protects Math ($...$) completely, only translates English
export async function translateTextToHindi(rawText: string): Promise<string> {
  if (!rawText || !rawText.trim()) return rawText;

  // If pure formula, return immediately with zero delay
  if (isMathBlock(rawText) || !hasTranslatableText(rawText)) {
    return rawText;
  }

  const overallKey = hashKey(rawText);

  // Check In-Memory Cache
  if (MEMORY_CACHE.has(overallKey)) {
    return MEMORY_CACHE.get(overallKey)!;
  }

  // Check LocalStorage Cache
  if (typeof window !== "undefined") {
    try {
      const disk = localStorage.getItem(`${STORAGE_PREFIX}${overallKey}`);
      if (disk) {
        MEMORY_CACHE.set(overallKey, disk);
        return disk;
      }
    } catch {}
  }

  // Split by KaTeX delimiters ($$...$$ or $...$) while retaining delimiters
  const segments = rawText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  // Translate only plain English fragments concurrently
  const translatedSegments = await Promise.all(
    segments.map(async (seg) => {
      if (!seg) return "";
      // Untouched Math blocks
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