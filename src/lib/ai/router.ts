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

export type ModelId = "gemini-flash" | "gemini-pro";

export interface RouteDecision {
  model: ModelId;
  maxTokens: number;
  useCache: boolean;
  reason: string;
}

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

const COMPLEX_KEYWORDS = [
  "analiz et", "rapor yaz", "detaylı", "kapsamlı", "strateji",
  "karşılaştır", "değerlendir", "öner", "plan", "proje",
  "analyze", "detailed", "comprehensive", "strategy", "compare",
];

export function detectTaskType(message: string): TaskType {
  const lower = message.toLowerCase();
  if (SEARCH_KEYWORDS.some((k) => lower.includes(k))) return "web_search";
  if (EMAIL_KEYWORDS.some((k) => lower.includes(k))) return "email_analysis";
  if (TASK_KEYWORDS.some((k) => lower.includes(k))) return "task_extraction";
  if (SUMMARY_KEYWORDS.some((k) => lower.includes(k))) return "summary";
  if (lower.includes("toplantı") || lower.includes("meeting")) return "meeting_notes";
  if (COMPLEX_KEYWORDS.some((k) => lower.includes(k))) return "complex_analysis";
  if (message.length < 100) return "simple_question";
  return "summary";
}

export function routeToModel(
  taskType: TaskType,
  _preferredModel?: string,
  webSearchEnabled?: boolean
): RouteDecision {
  // Web search → Gemini Flash with Search Grounding (free)
  if (webSearchEnabled || taskType === "web_search") {
    return {
      model: "gemini-flash",
      maxTokens: 2048,
      useCache: false,
      reason: "İnternet araması — Gemini Search Grounding",
    };
  }

  // Complex tasks → Gemini 2.5 Pro (more capable, still free tier)
  if (taskType === "document_draft" || taskType === "complex_analysis") {
    return {
      model: "gemini-pro",
      maxTokens: 4096,
      useCache: false,
      reason: "Karmaşık analiz — Gemini 2.5 Pro",
    };
  }

  // Everything else → Gemini Flash (fastest free model)
  return {
    model: "gemini-flash",
    maxTokens: 2048,
    useCache: false,
    reason: "Gemini 2.5 Flash — ücretsiz",
  };
}
