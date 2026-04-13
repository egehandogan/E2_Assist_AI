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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        content:
          "⚠️ Gemini API anahtarı yapılandırılmamış.\n\n" +
          "Vercel → Settings → Environment Variables bölümüne `GEMINI_API_KEY` ekleyin.",
        model: "none",
        modelName: "Yapılandırılmadı",
        route: null,
      });
    }

    // Map UI model names to internal model IDs
    const modelMap: Record<string, string> = {
      auto: "auto",
      flash: "gemini-flash",
      pro: "gemini-pro",
    };
    const mappedModel = modelMap[model] ?? "auto";

    const lastUserMessage =
      [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "";

    const taskType = detectTaskType(lastUserMessage);
    const route = routeToModel(taskType, mappedModel, webSearch);

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
        cached: false,
      },
      usage: {
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({
      content: `Bir hata oluştu: ${message}`,
      model: "error",
      modelName: "Hata",
    });
  }
}
