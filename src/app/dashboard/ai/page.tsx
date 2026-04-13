"use client";

import { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Send, Sparkles, Globe, Paperclip, Image,
  ChevronDown, Plus, Copy, ThumbsUp, ThumbsDown, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AIModel = "auto" | "flash" | "pro";

interface RouteInfo {
  model: string;
  reason: string;
  maxTokens: number;
  cached: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelName?: string;
  taskType?: string;
  route?: RouteInfo;
  usage?: { inputTokens?: number; outputTokens?: number };
  timestamp: Date;
}

const modelConfig: Record<AIModel, { name: string; icon: string; color: string; description: string }> = {
  auto: {
    name: "Otomatik",
    icon: "✨",
    color: "bg-blue-100 text-blue-700",
    description: "Göreve göre Flash veya Pro seçer",
  },
  flash: {
    name: "Gemini Flash",
    icon: "⚡",
    color: "bg-cyan-100 text-cyan-700",
    description: "Hızlı yanıt, ücretsiz",
  },
  pro: {
    name: "Gemini Pro",
    icon: "🔵",
    color: "bg-blue-100 text-blue-700",
    description: "Derin analiz, karmaşık görevler",
  },
};

const quickPrompts = [
  { label: "Bugünkü mailleri özetle", icon: "📧" },
  { label: "Toplantı notlarını düzenle", icon: "📝" },
  { label: "Görev listemi analiz et", icon: "✅" },
  { label: "Güncel haberleri araştır", icon: "🌐" },
  { label: "Resmi mektup taslağı yaz", icon: "📄" },
  { label: "Bütçe önerileri sun", icon: "💰" },
];

const mockHistory = [
  { id: "s1", title: "Bağışçı mektubu yazımı", date: "Bugün" },
  { id: "s2", title: "Nisan raporu analizi", date: "Dün" },
  { id: "s3", title: "Genel kurul gündemi", date: "3 gün önce" },
];

const taskTypeLabels: Record<string, string> = {
  simple_question: "Basit soru",
  summary: "Özet",
  email_analysis: "Mail analizi",
  meeting_notes: "Toplantı notu",
  document_draft: "Belge taslağı",
  complex_analysis: "Detaylı analiz",
  web_search: "İnternet araması",
  translation: "Çeviri",
  task_extraction: "Görev çıkarma",
};

export default function AIPage() {
  const [model, setModel] = useState<AIModel>("auto");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput ?? input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
          webSearch,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        modelName: data.modelName,
        taskType: data.taskType,
        route: data.route,
        usage: data.usage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Bağlantı hatası. Lütfen tekrar deneyin.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModel = modelConfig[model];

  return (
    <div className="flex h-full">
      {/* History sidebar */}
      <div className="w-56 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-700">
          <Button
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-xs"
            size="sm"
            onClick={() => setMessages([])}
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Sohbet
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-gray-500 px-2 mb-2 mt-1">Geçmiş</p>
          {mockHistory.map((h) => (
            <button
              key={h.id}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-0.5"
            >
              <p className="font-medium truncate">{h.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{h.date}</p>
            </button>
          ))}
        </div>

        {/* Free badge */}
        <div className="p-3 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-2.5 text-center">
            <p className="text-xs text-green-400 font-medium">✅ Tamamen Ücretsiz</p>
            <p className="text-xs text-gray-500 mt-0.5">Google Gemini API</p>
            <p className="text-xs text-gray-600 mt-1">
              {messages.filter(m => m.role === "assistant").length} yanıt
            </p>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Asistan</p>
              <p className="text-xs text-gray-500">Nurevşan Doğan — Smart Routing aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Web search toggle */}
            <button
              onClick={() => setWebSearch(!webSearch)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                webSearch
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              {webSearch ? "İnternet: Açık" : "İnternet"}
            </button>

            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelect(!showModelSelect)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition-colors"
              >
                <span>{selectedModel.icon}</span>
                <span>{selectedModel.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showModelSelect && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl border border-gray-100 shadow-xl z-10 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 px-2">Model Seç (Tümü Ücretsiz)</p>
                  </div>
                  {(["auto", "flash", "pro"] as AIModel[]).map((key) => {
                    const cfg = modelConfig[key];
                    return (
                      <button
                        key={key}
                        onClick={() => { setModel(key); setShowModelSelect(false); }}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left",
                          model === key && "bg-blue-50"
                        )}
                      >
                        <span className="text-base">{cfg.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{cfg.name}</p>
                          <p className="text-xs text-gray-400">{cfg.description}</p>
                        </div>
                        {model === key && <span className="text-blue-500 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Merhaba, Nurevşan! 👋
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                Smart Routing sistemi görevinize göre en uygun modeli otomatik seçer.
              </p>
              <p className="text-gray-400 text-xs mb-6 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Basit sorular → Haiku (en ucuz) · Karmaşık analiz → Sonnet · İnternet → Gemini
              </p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.label)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-left transition-all"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs text-gray-700">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                    msg.role === "user"
                      ? "bg-violet-600 text-white font-bold"
                      : "bg-white border border-gray-200 text-sm"
                  )}>
                    {msg.role === "user" ? "N" : "✨"}
                  </div>

                  <div className={cn(
                    "flex-1 max-w-[80%]",
                    msg.role === "user" && "flex flex-col items-end"
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Assistant metadata */}
                    {msg.role === "assistant" && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pl-1">
                        {msg.modelName && (
                          <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                            {msg.modelName}
                          </span>
                        )}
                        {msg.taskType && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {taskTypeLabels[msg.taskType] ?? msg.taskType}
                          </span>
                        )}
                        {msg.usage?.outputTokens && (
                          <span className="text-xs text-gray-300">
                            {msg.usage.outputTokens} token
                          </span>
                        )}
                        {msg.route?.cached && (
                          <span className="text-xs text-green-500 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> önbellek
                          </span>
                        )}
                        <div className="flex items-center gap-1 ml-1">
                          <button className="text-gray-300 hover:text-gray-500">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="text-gray-300 hover:text-green-500">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="text-gray-300 hover:text-red-400">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm">
                    ✨
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="text-xs text-gray-400 ml-2">
                        {webSearch ? "İnternet araması yapıyor..." : "Yanıt hazırlanıyor..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:border-violet-400 transition-colors">
              <Textarea
                placeholder="Mesajınızı yazın... (Shift+Enter: yeni satır)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 border-0 bg-transparent shadow-none resize-none text-sm focus-visible:ring-0 min-h-[44px] max-h-32 py-0"
                rows={1}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Image className="w-4 h-4" />
                </button>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-xl flex-shrink-0"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-1.5">
              {model === "auto"
                ? "✨ Otomatik — basit sorular Flash, karmaşık analizler Pro"
                : `${selectedModel.icon} ${selectedModel.name} seçili`}
              {webSearch && " · 🌐 Google Search Grounding aktif"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
