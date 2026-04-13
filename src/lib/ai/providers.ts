import type { ModelId } from "./router";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  model: ModelId;
  modelName: string;
  inputTokens?: number;
  outputTokens?: number;
}

const SYSTEM_PROMPT = `Sen Nurevşan Doğan'ın kişisel AI asistanısın. Nurevşan bir dernek başkanıdır.

Temel görevlerin:
- E-posta analizi, özetleme ve yanıt önerileri
- Toplantı planlama, not tutma ve özet çıkarma
- Görev listesi oluşturma ve takip
- Dernek yönetimiyle ilgili konularda destek
- Resmi yazışmalar ve belgeler

Kurallar:
- Her zaman Türkçe yanıt ver
- Kısa, net ve profesyonel ol
- Yapılabilir önerilerde bulun
- Dernek bağlamını göz önünde tut`;

// Gemini model fallback chains
const FLASH_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
];

const PRO_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",   // fallback to flash if pro unavailable
  "gemini-2.0-flash",
];

async function callGemini(
  messages: ChatMessage[],
  modelChain: string[],
  webSearch: boolean,
  maxTokens: number
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY yapılandırılmamış. Lütfen Vercel'e ekleyin.");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const baseBody: Record<string, unknown> = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens },
  };

  let lastError = "";

  for (const geminiModel of modelChain) {
    const body = { ...baseBody };

    // Search Grounding — only on Flash models (Pro doesn't support it in free tier)
    if (webSearch && !geminiModel.includes("pro")) {
      body.tools = [{ google_search: {} }];
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const usage = data.usageMetadata;
      return {
        content: text,
        model: geminiModel.includes("pro") ? "gemini-pro" : "gemini-flash",
        modelName: geminiModel,
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
      };
    }

    const errData = await res.json().catch(() => ({}));
    const errCode = (errData as { error?: { code?: number } }).error?.code;

    // Only retry on overload (503) or rate limit (429)
    if (errCode !== 503 && errCode !== 429) {
      lastError = JSON.stringify((errData as { error?: unknown }).error ?? errData);
      break;
    }
    lastError = JSON.stringify((errData as { error?: unknown }).error ?? errData);
  }

  throw new Error(`Gemini: ${lastError}`);
}

export async function callAI(
  messages: ChatMessage[],
  modelId: ModelId,
  maxTokens: number,
  _useCache: boolean,
  webSearch: boolean
): Promise<AIResponse> {
  const chain = modelId === "gemini-pro" ? PRO_MODELS : FLASH_MODELS;
  return callGemini(messages, chain, webSearch, maxTokens);
}
