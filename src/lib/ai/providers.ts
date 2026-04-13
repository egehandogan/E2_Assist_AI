/**
 * AI Provider implementations
 * Each provider is initialized lazily to avoid errors when keys are missing
 */

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
  cached?: boolean;
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

// ─── Claude (Anthropic) ───────────────────────────────────────────────────────

async function callClaude(
  messages: ChatMessage[],
  modelId: "haiku" | "sonnet",
  maxTokens: number,
  useCache: boolean
): Promise<AIResponse> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const modelName =
    modelId === "haiku"
      ? "claude-haiku-4-5-20251001"
      : "claude-sonnet-4-6";

  const systemContent = useCache
    ? ([
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ] as Parameters<typeof client.messages.create>[0]["system"])
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: modelName,
    max_tokens: maxTokens,
    system: systemContent,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return {
    content: content.text,
    model: modelId,
    modelName: modelId === "haiku" ? "Claude Haiku 4.5" : "Claude Sonnet 4.6",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cached: useCache,
  };
}

// ─── Gemini (Google) ──────────────────────────────────────────────────────────

async function callGemini(
  messages: ChatMessage[],
  webSearch: boolean,
  maxTokens: number
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  // Build contents for Gemini API format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens },
  };

  // Enable Google Search grounding for web search
  if (webSearch) {
    body.tools = [{ google_search: {} }];
  }

  // Try newest model first, fall back to lite on quota issues
  const geminiModel = "gemini-2.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return {
    content: text,
    model: "gemini-flash",
    modelName: "Gemini 2.5 Flash",
  };
}

// ─── GPT-4o-mini (OpenAI) ─────────────────────────────────────────────────────

async function callOpenAI(
  messages: ChatMessage[],
  maxTokens: number
): Promise<AIResponse> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    model: "gpt4o-mini",
    modelName: "GPT-4o mini",
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function callAI(
  messages: ChatMessage[],
  modelId: ModelId,
  maxTokens: number,
  useCache: boolean,
  webSearch: boolean
): Promise<AIResponse> {
  // Fallback chain: if primary fails, try next available
  const tryCall = async (id: ModelId): Promise<AIResponse> => {
    switch (id) {
      case "haiku":
        return callClaude(messages, "haiku", maxTokens, useCache);
      case "sonnet":
        return callClaude(messages, "sonnet", maxTokens, useCache);
      case "gemini-flash":
        return callGemini(messages, webSearch, maxTokens);
      case "gpt4o-mini":
        return callOpenAI(messages, maxTokens);
    }
  };

  // Determine fallback order
  const fallbackOrder: ModelId[] =
    modelId === "gemini-flash"
      ? ["gemini-flash", "haiku", "gpt4o-mini"]
      : modelId === "sonnet"
      ? ["sonnet", "haiku", "gemini-flash"]
      : ["haiku", "gemini-flash", "gpt4o-mini", "sonnet"];

  let lastError: Error | null = null;
  for (const id of fallbackOrder) {
    try {
      // Skip if key not configured
      if (id === "gemini-flash" && !process.env.GEMINI_API_KEY) continue;
      if ((id === "haiku" || id === "sonnet") && !process.env.ANTHROPIC_API_KEY) continue;
      if (id === "gpt4o-mini" && !process.env.OPENAI_API_KEY) continue;

      return await tryCall(id);
    } catch (err) {
      lastError = err as Error;
      console.error(`AI provider ${id} failed:`, err);
      continue;
    }
  }

  throw lastError ?? new Error("Tüm AI modelleri başarısız oldu");
}
