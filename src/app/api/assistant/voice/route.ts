import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assistantTools } from "@/lib/ai/assistant";
import { getGoogleApis } from "@/lib/google";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authSession = await auth();
    const userId = authSession?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Initial AI call to detect intent and tools
    const body = {
      system_instruction: { 
        parts: [{ text: `Sen "Egeman" isminde profesyonel bir sesli asistansın. 
        Kullanıcı: Nurevşan Doğan. Dil: Türkçe. 
        Görev: Email, takvim ve not yönetimi. 
        Kritik işlemlerde mutlaka "Onaylıyor musunuz?" diye sor.` }] 
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ function_declarations: assistantTools }],
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.functionCall) {
      const { name, args } = part.functionCall;
      
      // Handle the tools
      const apis = await getGoogleApis(userId);
      
      if (name === "get_emails") {
        if (!apis) return NextResponse.json({ response: "Google bağlantınız bulunamadı." });
        await apis.gmail.users.messages.list({ userId: "me", maxResults: 3 });
        return NextResponse.json({ 
          response: "Son e-postalarınızı kontrol ettim. Özetlememi ister misiniz?",
          immediateFeedback: "Gelen kutunuza bakıyorum." 
        });
      }

      if (name === "save_note") {
        await prisma.note.create({
          data: {
            title: "Sesli Not",
            content: args.content as string,
            userId: userId,
            source: "voice",
          }
        });
        return NextResponse.json({ response: "Notunuzu başarıyla kaydettim." });
      }

      // Add more tool handlers as needed...
    }

    return NextResponse.json({ 
      response: part?.text || "Size nasıl yardımcı olabilirim?",
    });

  } catch (error) {
    console.error("Assistant Error:", error);
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
