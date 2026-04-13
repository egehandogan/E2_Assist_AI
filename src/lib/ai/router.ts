/**
 * Smart AI Router
 * Routes requests to the optimal model based on task type and complexity
 * to minimize token cost while maximizing quality.
 */

export type TaskType =
  | "simple_question"
  | "summary"
  | "email_analysis"
  | "meeting_notes"
  | "document_draft"
  | "complex_analysis"
  | "web_search"
  | "translation"
  | "task_extraction";

export type ModelId = "haiku" | "sonnet" | "gemini-flash" | "gpt4o-mini";

export interface RouteDecision {
  model: ModelId;
  maxTokens: number;
  useCache: boolean;
  reason: string;
}

// Keywords that indicate task complexity
const COMPLEX_KEYWORDS = [
  "analiz et", "rapor yaz", "detaylı", "kapsamlı", "strateji",
  "karşılaştır", "değerlendir", "öner", "plan", "proje",
  "analyze", "detailed", "comprehensive", "strategy", "compare",
];

const SEARCH_KEYWORDS = [
  "araştır", "bul", "güncel", "haber", "internet", "web",
  "araştırma yap", "search", "find", "latest", "news", "current",
];

const SUMMARY_KEYWORDS = [
  "özetle", "özet", "kısaca", "ne hakkında", "anlat",
  "summarize", "summary", "brief", "what is", "explain",
];

const EMAIL_KEYWORDS = [
  "mail", "e-posta", "email", "mesaj", "yanıt", "cevap",
  "reply", "response", "inbox", "gelen kutusu",
];

const TASK_KEYWORDS = [
  "görev", "yapılacak", "hatırlat", "takip", "deadline",
  "task", "todo", "remind", "follow up", "due",
];

export function detectTaskType(message: string): TaskType {
  const lower = message.toLowerCase();

  if (SEARCH_KEYWORDS.some((k) => lower.includes(k))) return "web_search";
  if (EMAIL_KEYWORDS.some((k) => lower.includes(k))) return "email_analysis";
  if (TASK_KEYWORDS.some((k) => lower.includes(k))) return "task_extraction";
  if (SUMMARY_KEYWORDS.some((k) => lower.includes(k))) return "summary";
  if (lower.includes("toplantı") || lower.includes("meeting")) return "meeting_notes";
  if (lower.includes("yaz") || lower.includes("oluştur") || lower.includes("draft")) {
    if (COMPLEX_KEYWORDS.some((k) => lower.includes(k))) return "document_draft";
  }
  if (COMPLEX_KEYWORDS.some((k) => lower.includes(k))) return "complex_analysis";
  if (message.length < 100) return "simple_question";

  return "summary";
}

export function routeToModel(
  taskType: TaskType,
  preferredModel?: string,
  webSearchEnabled?: boolean
): RouteDecision {
  // User override
  if (preferredModel && preferredModel !== "auto") {
    const modelMap: Record<string, ModelId> = {
      claude: "sonnet",
      haiku: "haiku",
      openai: "gpt4o-mini",
      gemini: "gemini-flash",
    };
    const model = modelMap[preferredModel] || "haiku";
    return {
      model,
      maxTokens: 2048,
      useCache: true,
      reason: `Kullanıcı tercihi: ${preferredModel}`,
    };
  }

  // Web search always → Gemini (free search grounding)
  if (webSearchEnabled || taskType === "web_search") {
    return {
      model: "gemini-flash",
      maxTokens: 2048,
      useCache: false,
      reason: "İnternet araması için Gemini Flash (ücretsiz Search Grounding)",
    };
  }

  switch (taskType) {
    case "simple_question":
    case "translation":
      return {
        model: "haiku",
        maxTokens: 512,
        useCache: true,
        reason: "Basit soru için Haiku (en hızlı ve ucuz)",
      };

    case "summary":
    case "email_analysis":
    case "task_extraction":
      return {
        model: "haiku",
        maxTokens: 1024,
        useCache: true,
        reason: "Özet/analiz için Haiku (cache ile %90 tasarruf)",
      };

    case "meeting_notes":
      return {
        model: "haiku",
        maxTokens: 2048,
        useCache: true,
        reason: "Toplantı notları için Haiku",
      };

    case "document_draft":
    case "complex_analysis":
      return {
        model: "sonnet",
        maxTokens: 4096,
        useCache: true,
        reason: "Karmaşık analiz için Sonnet 4.6 (en yüksek kalite)",
      };

    default:
      return {
        model: "haiku",
        maxTokens: 1024,
        useCache: true,
        reason: "Varsayılan: Haiku (optimum maliyet)",
      };
  }
}
