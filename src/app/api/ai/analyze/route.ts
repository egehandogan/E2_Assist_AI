import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

async function gemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "GEMINI_API_KEY tanımlı değil. Vercel ortam değişkenlerini kontrol edin.";

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
      const err = await res.json().catch(() => ({}));
      const code = (err as { error?: { code?: number } }).error?.code;
      if (code !== 503 && code !== 429) break;
    } catch {
      continue;
    }
  }
  return "AI yanıt veremedi. Lütfen tekrar deneyin.";
}

export async function POST(req: NextRequest) {
  try {
    const { type, content } = await req.json();

    let prompt = "";

    switch (type) {
      case "email_summary":
        prompt = `Aşağıdaki e-postayı Türkçe olarak 2-3 cümleyle özetle. Sadece özeti yaz, başka bir şey ekleme:\n\n${content}`;
        break;

      case "email_reply":
        prompt = `Aşağıdaki e-postaya profesyonel ve kısa bir Türkçe yanıt taslağı yaz. Sadece yanıt metnini yaz:\n\n${content}`;
        break;

      case "email_research":
        prompt = `Aşağıdaki e-posta içeriğiyle ilgili önemli bilgiler ve öneriler sun. Türkçe, madde madde yaz:\n\n${content}`;
        break;

      case "meeting_summary":
        prompt = `Aşağıdaki toplantı notlarını Türkçe olarak özetle. Kararlar, eylem maddeleri ve katılımcıları belirt:\n\n${content}`;
        break;

      case "extract_tasks":
        prompt = `Aşağıdaki toplantı notlarından görev listesi çıkar. Her görevi JSON dizisi olarak döndür: [{"title":"...", "assignee":"...", "priority":"high|medium|low", "dueDate":"..."}]. Sadece JSON döndür:\n\n${content}`;
        break;

      case "note_enhance":
        prompt = `Aşağıdaki notu düzenle ve geliştir. Türkçe, profesyonel ve düzenli hale getir:\n\n${content}`;
        break;

      case "quick_analysis":
        prompt = `Nurevşan Doğan bir dernek başkanıdır. Aşağıdaki konuyu kısa ve net Türkçe analiz et:\n\n${content}`;
        break;

      default:
        prompt = content;
    }

    const result = await gemini(prompt);

    // For task extraction, try to parse JSON
    if (type === "extract_tasks") {
      try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return NextResponse.json({ result, tasks: JSON.parse(jsonMatch[0]) });
        }
      } catch { /* return raw result */ }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[ai/analyze]", error);
    const msg = error instanceof Error ? error.message : "Hata";
    return NextResponse.json({ result: `Hata: ${msg}` });
  }
}
