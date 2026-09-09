import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Runs on Cloudflare Workers edge runtime

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");

  if (!text || !text.trim()) {
    return NextResponse.json({ translatedText: "" });
  }

  try {
    // 1. Primary: Server-side Google Translate Gateway (No CORS restrictions here)
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
      // Cache at edge for 7 days
      cf: {
        cacheTtl: 604800,
        cacheEverything: true,
      },
    } as RequestInit);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: unknown[]) => (Array.isArray(item) ? item[0] : "")).join("");
        return NextResponse.json({ translatedText: translated });
      }
    }
  } catch {}

  // 2. Secondary: Fallback to MyMemory
  try {
    const backupUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
    const response = await fetch(backupUrl);
    if (response.ok) {
      const data = await response.json();
      if (data?.responseData?.translatedText) {
        return NextResponse.json({ translatedText: data.responseData.translatedText });
      }
    }
  } catch {}

  // Fallback to original text if both fail
  return NextResponse.json({ translatedText: text });
}