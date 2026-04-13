import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Sen Nurevşan Doğan'ın kişisel AI asistanısın. Nurevşan bir dernek başkanıdır.

Görevlerin:
- E-posta analizi ve özetleme
- Toplantı planlama ve not tutma
- Araştırma yapma ve öneriler sunma
- Görev listesi yönetimi
- Resmi yazışmalar için yardım
- Dernek yönetimi konularında destek

Her zaman Türkçe yanıt ver. Kısa, net ve profesyonel ol.
Gerektiğinde araştırma yapacağını belirt ve web araması önerilerinde bulun.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, model, webSearch } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          content: "API anahtarı yapılandırılmamış. Lütfen Ayarlar sayfasından ANTHROPIC_API_KEY'i ekleyin.",
          model: "claude",
        },
        { status: 200 }
      );
    }

    const systemMessage = webSearch
      ? `${SYSTEM_PROMPT}\n\nNot: Kullanıcı internet araması istedi. Güncel bilgi gerektiren sorularda bunu belirt ve araştırma önerileri sun.`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: systemMessage,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({
      content: content.text,
      model: "claude",
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { content: "Bir hata oluştu. Lütfen tekrar deneyin.", model: "claude" },
      { status: 200 }
    );
  }
}
