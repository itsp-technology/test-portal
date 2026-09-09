import { Question } from "@/types/exam";
import { parseMarkdownQuestions } from "./markdownParser";

const memoryTestCache = new Map<string, Question[]>();

export async function getOrFetchExamQuestions(
  examId: string,
  filePath?: string
): Promise<Question[]> {
  // 1. Check RAM Cache
  if (memoryTestCache.has(examId)) {
    return memoryTestCache.get(examId)!;
  }

  // 2. Check LocalStorage Cache
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`cbt_cached_q_${examId}`);
    if (cached) {
      try {
        const parsed: Question[] = JSON.parse(cached);
        if (parsed.length > 0) {
          memoryTestCache.set(examId, parsed);
          return parsed;
        }
      } catch {
        // Fall through on corrupt cache
      }
    }
  }

  // 3. Resolve target URL: uses custom filePath if provided, else falls back to flat /tests/${examId}.md
  const targetUrl = filePath ? `/${filePath.replace(/^\//, "")}` : `/tests/${examId}.md`;

  const res = await fetch(targetUrl, { cache: "force-cache" });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Test paper not found at ${targetUrl}. Check file location.`);
    }
    throw new Error(`Failed to load test paper (HTTP ${res.status}).`);
  }

  const text = await res.text();
  const parsed = parseMarkdownQuestions(text);

  if (!parsed || parsed.length === 0) {
    throw new Error("The question paper is empty or contains no valid formatted questions.");
  }

  // Store in RAM and LocalStorage
  memoryTestCache.set(examId, parsed);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`cbt_cached_q_${examId}`, JSON.stringify(parsed));
    } catch {
      // Storage quota safety
    }
  }

  return parsed;
}

export function invalidateExamCache(examId: string) {
  memoryTestCache.delete(examId);
  if (typeof window !== "undefined") {
    localStorage.removeItem(`cbt_cached_q_${examId}`);
  }
}