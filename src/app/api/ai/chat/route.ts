import { NextRequest, NextResponse } from "next/server";
import { detectTaskType, routeToModel } from "@/lib/ai/router";
import { callAI } from "@/lib/ai/providers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, model, webSearch, sessionId } = await req.json();

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

    const modelMap: Record<string, string> = {
      auto: "auto",
      flash: "gemini-flash",
      pro: "gemini-pro",
    };
    const mappedModel = modelMap[model] ?? "auto";

    const lastUserMessage =
      [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user")?.content ?? "";

    const taskType = detectTaskType(lastUserMessage);
    const route = routeToModel(taskType, mappedModel, webSearch);

    const response = await callAI(
      messages,
      route.model,
      route.maxTokens,
      route.useCache,
      webSearch ?? false
    );

    const assistantMsg = {
      role: "assistant",
      content: response.content,
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
      timestamp: new Date().toISOString(),
    };

    // Save to DB
    const allMessages = [...messages, assistantMsg];
    let currentSessionId = sessionId;
    
    if (!currentSessionId) {
      // Auto generate a 3-4 word title
      let title = "Yeni Sohbet";
      try {
        const titleRes = await callAI(
          [{ role: "user", content: `Aşağıdaki mesaja 3-4 kelimelik kısa bir başlık üret (sadece başlığı döndür):\n\n${lastUserMessage}` }],
          "gemini-flash",
          50,
          false,
          false
        );
        if (titleRes.content) title = titleRes.content.replace(/["']/g, "").trim();
      } catch (e) { console.error("Title generation failed", e); }

      const newSession = await prisma.chatSession.create({
        data: {
          userId,
          title,
          model: mappedModel,
          messages: JSON.stringify(allMessages),
        }
      });
      currentSessionId = newSession.id;
    } else {
      await prisma.chatSession.update({
        where: { id: currentSessionId },
        data: { messages: JSON.stringify(allMessages) }
      });
    }

    return NextResponse.json({
      ...assistantMsg,
      sessionId: currentSessionId,
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
