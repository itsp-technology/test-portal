import { Question } from "@/types/exam";
import { parseMarkdownQuestions } from "./markdownParser";

// In-memory hot cache across the browser session
const memoryTestCache = new Map<string, Question[]>();

export async function getOrFetchExamQuestions(examId: string): Promise<Question[]> {
  // 1. Level 1: Hot RAM Cache
  if (memoryTestCache.has(examId)) {
    return memoryTestCache.get(examId)!;
  }

  // 2. Level 2: Local Storage Cache
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
        // Corrupted cache, continue to fetch
      }
    }
  }

  // 3. Level 3: Network Fetch
  const res = await fetch(`/tests/${examId}.md`, { cache: "force-cache" });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("This test paper has not been uploaded yet.");
    }
    throw new Error(`Failed to load test (HTTP ${res.status})`);
  }

  const text = await res.text();
  const parsed = parseMarkdownQuestions(text);

  if (!parsed || parsed.length === 0) {
    throw new Error("Question paper format is empty or invalid.");
  }

  // Save to both RAM and Local Storage
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