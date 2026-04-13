import { NextRequest, NextResponse } from "next/server";
import { detectTaskType, routeToModel } from "@/lib/ai/router";
import { callAI } from "@/lib/ai/providers";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, model, webSearch } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });
    }

    // Check at least one AI key is configured
    const hasAnyKey =
      process.env.ANTHROPIC_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!hasAnyKey) {
      return NextResponse.json({
        content:
          "⚠️ Henüz bir AI API anahtarı yapılandırılmamış.\n\n" +
          "Lütfen Vercel'de şu environment variable'lardan en az birini ekleyin:\n" +
          "• `ANTHROPIC_API_KEY` (önerilen — Claude Haiku/Sonnet)\n" +
          "• `GEMINI_API_KEY` (ücretsiz — Gemini Flash)\n" +
          "• `OPENAI_API_KEY` (yedek — GPT-4o mini)",
        model: "none",
        modelName: "Yapılandırılmadı",
        route: null,
      });
    }

    // Detect task type from the last user message
    const lastUserMessage =
      [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "";

    const taskType = detectTaskType(lastUserMessage);
    const route = routeToModel(taskType, model, webSearch);

    // Call the selected AI model (with automatic fallback)
    const response = await callAI(
      messages,
      route.model,
      route.maxTokens,
      route.useCache,
      webSearch ?? false
    );

    return NextResponse.json({
      content: response.content,
      model: response.model,
      modelName: response.modelName,
      taskType,
      route: {
        model: route.model,
        reason: route.reason,
        maxTokens: route.maxTokens,
        cached: route.useCache,
      },
      usage: {
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const message =
      error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      {
        content: `Bir hata oluştu: ${message}`,
        model: "error",
        modelName: "Hata",
      },
      { status: 200 } // Return 200 so frontend can show the error message
    );
  }
}
